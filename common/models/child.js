'use strict';

module.exports = function (_Child) {

  const Promise = require('bluebird');
  const _ = require('lodash');

  const BuildHelper = require('../../server/build-helper');
  const app = require('../../server/server');

  const utils = require(`${process.cwd()}/node_modules/loopback/lib/utils`);

  let AppConstant;
  let Characteristic;
  let ResponseHelper;
  let ValidationHelper;

  BuildHelper
    .build(Child, _Child)
    .then(function () {

      Characteristic = app.models.Characteristic;

      let oldCreate = _Child.create;
      _Child.create = function (data) {
        let args = _.slice(data);
        let callback = args[args.length - 1];
        if (_.isFunction(callback)) {
          args.pop();
        } else {
          callback = utils.createPromiseCallback();
        }

        oldCreate
          .apply(this, args)
          .then(function (child) {
            return Characteristic
              .find({fields: ['id']})
              .then(function (characteristics) {
                let childCharacteristics = _.map(characteristics, function (characteristic) {
                  return {
                    characteristicId: characteristic.id
                  };
                });
                return child.characteristics.create(childCharacteristics);
              })
              .then(function () {
                callback(null, child);
              });
          })
          .catch(callback);
        return callback.promise;
      };

    });

  function Child() {
  }
};
