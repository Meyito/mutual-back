'use strict';

module.exports = function (_Child) {

  const Promise = require('bluebird');
  const _ = require('lodash');

  const BuildHelper = require('../../server/build-helper');
  const app = require('../../server/server');

  const utils = require(`${process.cwd()}/node_modules/loopback/lib/utils`);

  let AppConstant;
  let Characteristic;
  let Alertmeter;
  let ResponseHelper;
  let ValidationHelper;
  let ChildCharacteristic;
  let Challenge;

  BuildHelper
    .build(Child, _Child)
    .then(function () {

      Characteristic = app.models.Characteristic;
      Alertmeter = app.models.Alertmeter;
      Challenge = app.models.Challenge;
      ChildCharacteristic = app.models.ChildCharacteristic;

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
  Child.prototype.assignChallenge = function (cb) {
    cb = cb || utils.createPromiseCallback();

    Challenge.assingOneTo(this)
      .then(function (resp) {
        cb(null, resp);
      })
      .catch(cb);

    return cb.promise;
  };
  _Child.remoteMethod('assignChallenge', {
    isStatic: false,
    http: {
      verb: 'post',
      path: '/assign-challenge'
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
