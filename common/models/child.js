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

  BuildHelper
    .build(Child, _Child)
    .then(function () {

      Characteristic = app.models.Characteristic;
      Alertmeter = app.models.Alertmeter;

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

                if (_.isArray(children)) {
                  return Promise.all(_.map(children, (child) => child.characteristics.create(childCharacteristics)));
                }

                return children.characteristics.create(childCharacteristics);
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

  function Child() {
  }
};
