'use strict';

module.exports = function (_Child) {

  const Promise = require('bluebird');
  const _ = require('lodash');
  const moment = require('moment');

  const BuildHelper = require('../../server/build-helper');
  const app = require('../../server/server');

  const utils = require(`${process.cwd()}/node_modules/loopback/lib/utils`);

  let Characteristic;
  let Alertmeter;
  let ChildCharacteristic;
  let Challenge;
  let BatchHelper
  let ResponseHelper
  let AppUserGoal
  let AppUserData
  let Event
  let Goal
  let Push
  let DH

  BuildHelper
    .build(Child, _Child)
    .then(function () {

      Characteristic = app.models.Characteristic;
      Alertmeter = app.models.Alertmeter;
      Challenge = app.models.Challenge;
      ChildCharacteristic = app.models.ChildCharacteristic;
      BatchHelper = app.models.BatchHelper
      ResponseHelper = app.models.ResponseHelper;
      AppUserGoal = app.models.AppUserGoal
      AppUserData = app.models.AppUserData
      Event = app.models.Event
      Goal = app.models.Goal
      Push = app.models.Push
      DH = app.models.DebugHelper


      let beginTransaction = Promise.promisify(_Child.beginTransaction, {context: _Child});

      let oldCreate = _Child.create;
      _Child.create = function (data, options, cb) {
        if (!options && !cb) {
          if (_.isFunction(data)) {
            cb = data;
            data = {};
          }
        } else if (cb === undefined) {
          if (_.isFunction(options)) {
            // create(data, cb);
            cb = options;
          }
        }

        if (!options) {
          options = {};
        }
        if (!_.isFunction(cb)) {
          cb = utils.createPromiseCallback();
        }

        let transaction

        let postTransaction = (trans) => {
          transaction = options.transaction = trans

          return oldCreate.call(this, data, options)
            .then(function (children) {
              if (_.isArray(children)) {
                return cb(null, children);
              }

              let characteristicPromise = Characteristic
                .find({fields: ['id']})
                .then(function (characteristics) {
                  if (characteristics.length === 0) {
                    return Promise.resolve();
                  }

                  let childCharacteristics = _.map(characteristics, function (characteristic) {
                    return {
                      characteristicId: characteristic.id
                    };
                  });

                  return Promise.all([
                    children.characteristics.create(childCharacteristics, {transaction}),
                    Challenge.assingOneTo(children, transaction)
                  ]);
                })

              let goalPromise = Goal.findOne({where: {slug: 'exploradores'}})
                .then(function (goal) {
                  let goalId = goal.id
                  return AppUserGoal.findOne({where: {userId: children.userId, goalId: goalId}})
                    .then(function (appUserGoal) {
                      if (appUserGoal) return Promise.resolve(appUserGoal);
                      return AppUserGoal.create({userId: children.userId, goalId: goalId}, {transaction})
                    })
                })

              Promise.all([
                characteristicPromise,
                goalPromise
              ])
                .then(function (res) {
                  AppUserData
                    .findOne({where: {appuserId: children.userId}})
                    .then(function (userData) {
                      Event.create({
                        type: Event.EVENT_TYPES.childRegistry,
                        userid: children.userId,
                        genderchildid: children.genderId,
                        municipalityid: userData.municipalityId,
                        birthday: children.birthday,
                        childid: children.id
                      }).catch((err) => DH.debug.error(err));
                    })
                  if (!transaction) {
                    return cb(null, children);
                  }
                  transaction.commit(function (err) {
                    cb(err, children)
                  })
                });
            })
        }

        let promise
        if (_.isArray(data)) {
          promise = postTransaction()
        } else {
          promise = beginTransaction({timeout: 120000})
            .then(postTransaction);
        }
        promise.catch(function (err) {
          if (!transaction) {
            return cb(err)
          }
          transaction.rollback(function () {
            cb(err);
          })
        })
        return cb.promise;
      };


      let oldFindOne = _Child.findOne;
      _Child.findOne = function (query, options, cb) {
        if (options === undefined && cb === undefined) {
          if (typeof query === 'function') {
            cb = query;
            query = {};
          }
        } else if (cb === undefined) {
          if (typeof options === 'function') {
            cb = options;
            options = {};
          }
        }

        cb = cb || utils.createPromiseCallback();
        query = query || {};
        options = options || {};

        if (!query.include) {
          query.include = [];
        } else if (!_.isArray(query.include)) {
          query.include = [query.include];
        }

        query.include.push({
          relation: 'characteristics',
          scope: {
            include: {
              relation: 'characteristic'
            }
          }
        });

        oldFindOne
          .call(this, query, options)
          .then(function (instance) {
            if (!instance) {
              return cb(null, null);
            }
            return Alertmeter
              .calculate(instance.__data.characteristics)
              .then(function (value) {
                instance.__data.alertmeterValue = value;
                cb(null, instance);
              });
          })
          .catch(cb);

        return cb.promise;
      };

    });


  /**
   *
   * @param [cb]
   *
   * @return {Promise}
   */
  Child.prototype.assignChallenge = async function (cb) {
    try {
      let resp = await Challenge.assingOneTo(this);
      return ResponseHelper.successHandler(resp, cb);
    } catch (err) {
      ResponseHelper.errorHandler(err, cb);
    }
  };
  _Child.remoteMethod('assignChallenge', {
    isStatic: false,
    http: {
      verb: 'post',
      path: '/assign-challenge'
    }
  });

  /**
   *
   * @param [cb]
   *
   * @return {Promise}
   */
  Child.assignChallenges = async function (cb) {
    try {
      let where = {
        lastChallengeAssignment: {
          lte: moment().subtract(1, 'days').toDate()
        }
      };

      await BatchHelper.applyToNoRepetibleList(_Child, where, (child) => Challenge.assingOneTo(child))
      return ResponseHelper.successHandler({}, cb)
    } catch (err) {
      ResponseHelper.errorHandler(err, cb)
    }
  };
  _Child.remoteMethod('assignChallenges', {
    http: {
      verb: 'get',
      path: '/assign-challenges'
    }
  });


  Child.prototype.addMissingCharacteristics = async function (requiredCharacteristics) {
    let currentCharacteristics = _.map(this.characteristics(), 'characteristicId');
    let statusValue = await Alertmeter.calculate(this.characteristics());

    let missingCharacteristicsIds = _.difference(requiredCharacteristics, currentCharacteristics);
    if (missingCharacteristicsIds.length === 0) {
      return [];
    }

    let missingCharacteristics = _.map(missingCharacteristicsIds, function (characteristicId) {
      return {characteristicId, statusValue};
    });

    let characteristics = await this.characteristics.create(missingCharacteristics)
    await Promise.all(_.map(characteristics, function (childCharacteristic) {
      return new Promise(function (resolve, reject) {
        childCharacteristic.characteristic(function (err) {
          if (err) return reject(err)
          resolve()
        });
      });
    }))
    return characteristics
  };


  Child.prototype.checkLowCharacteristicLevel = async function (parent) {
    let characteristics = this.characteristics()

    _.forEach(characteristics, (childCharacteristic) => {
      if (childCharacteristic.statusValue < childCharacteristic.characteristic().minValueAlert) {
        Event.create({
          type: Event.EVENT_TYPES.lowCharacteristicValue,
          genderchildid: this.genderId,
          municipalityid: parent.data().municipalityId,
          birthday: this.birthday,
          childid: this.id,
          characteristicid: childCharacteristic.characteristicId,
          characteristicvalue: childCharacteristic.statusValue
        }).catch((err) => DH.debug.error(err));

        Push.send(parent, {
          title: '¡Tu hijo podría estar en riesgo!',
          body: childCharacteristic.characteristic().alertMessage
        });
      }
    })

    let alertmeterValue = Alertmeter.calculate(characteristics)
    if (alertmeterValue < -10) {
      Event.create({
        type: Event.EVENT_TYPES.lowAlermeterValue,
        genderchildid: this.genderId,
        municipalityid: parent.data().municipalityId,
        birthday: this.birthday,
        childid: this.id,
        alermetervalue: alertmeterValue
      }).catch((err) => DH.debug.error(err));
      Push.send(parent, {
        title: '¡Tu hijo podría estar en riesgo!',
        body: 'El Alertometro de tu hijo se encuentra por debajo de los niveles normales.'
      });
    }
    Event.create({
      type: Event.EVENT_TYPES.alermeterValue,
      genderchildid: this.genderId,
      municipalityid: parent.data().municipalityId,
      birthday: this.birthday,
      childid: this.id,
      alermetervalue: alertmeterValue
    }).catch((err) => DH.debug.error(err));

  }

  function Child() {
  }
};
