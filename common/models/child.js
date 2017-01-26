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
  let BashHelper
  let ResponseHelper

  BuildHelper
    .build(Child, _Child)
    .then(function ()   {

      Characteristic = app.models.Characteristic;
      Alertmeter = app.models.Alertmeter;
      Challenge = app.models.Challenge;
      ChildCharacteristic = app.models.ChildCharacteristic;
      BashHelper = app.models.BashHelper
      ResponseHelper = app.models.ResponseHelper;

      let oldCreate = _Child.create;
      _Child.create = function () {
        let args = _.slice(arguments);
        let callback = args[args.length - 1];
        if (_.isFunction(callback)) {
          args.pop();
        } else {
          callback = utils.createPromiseCallback();
        }

        oldCreate
          .apply(this, args)
          .then(function (children) {
            if (_.isArray(children)) {
              return callback(null, children);
            }
            return Characteristic
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
                  children.characteristics.create(childCharacteristics),
                  Challenge.assingOneTo(children)
                ]);
              })
              .then(function () {
                callback(null, children);
              });
          })
          .catch(callback);
        return callback.promise;
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
            if(!instance){
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

      await BashHelper.applyToNoRepetibleList(_Child, where, (child) => Challenge.assingOneTo(child))
      return ResponseHelper.successHandler({}, cb)
    } catch (err) {
      ResponseHelper.errorHandler(err, cb)
    }
  };
  _Child.remoteMethod('assignChallenges', {
    isStatic: false,
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
    return await this.characteristics.create(missingCharacteristics);
  };

  function Child() {
  }
};
