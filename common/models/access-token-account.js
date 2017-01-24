module.exports = function (_AccessTokenAccount) {
  const Promise = require('bluebird');
  const _ = require('lodash');

  const utils = require(`${process.cwd()}/node_modules/loopback/lib/utils`);

  const BuildHelper = require('../../server/build-helper');
  const app = require('../../server/server');

  let ResponseHelper;
  let DH;


  BuildHelper
    .build(AccessTokenAccount, _AccessTokenAccount)
    .then(function () {
      ResponseHelper = app.models.ResponseHelper;
      DH = app.models.DebugHelper;
    });

  AccessTokenAccount.prototype.updateRegistrationId = async function (registrationId, cb) {
    try {
      await this.updateAttribute('registrationId', registrationId);
      return ResponseHelper.successHandler(this, cb);
    } catch (err) {
      ResponseHelper.errorHandler(err, cb);
    }
  };
  _AccessTokenAccount.remoteMethod('updateRegistrationId', {
    isStatic: false,
    http: {
      verb: 'put',
      path: '/update-registration-id'
    },
    accepts: [
      {arg: 'registrationId', type: 'string', required: true}
    ],
    returns: [
      {type: 'AccessTokenAccount', root: true}
    ]
  });

  function AccessTokenAccount() {
  }

};
