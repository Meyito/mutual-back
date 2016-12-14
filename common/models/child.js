'use strict';

module.exports = function (_Child) {

  const Promise = require('bluebird');

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
      _Child.create = function (data, callback) {
        callback = callback || utils.createPromiseCallback();
        oldCreate
          .call(this, data)
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
