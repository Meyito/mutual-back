'use strict';

/**
 *
 * @param {AppUserAccount} _AppUserAccount
 */
module.exports = function (_AppUserAccount) {
  const Promise = require('bluebird');
  const path = require('path');
  const crypto = require('crypto');
  const _ = require('lodash');

  const BuildHelper = require('../../server/build-helper');
  const app = require('../../server/server');

  let AppConstant;
  let ResponseHelper;

  BuildHelper
    .build(AppUserAccount, _AppUserAccount)
    .then(function () {
      AppConstant = app.models.AppConstant;
      ResponseHelper = app.models.ResponseHelper;
    });


  async function generateVerificationToken() {
    let randomBytesFn = Promise.promisify(crypto.randomBytes, {context: crypto});
    let buff = await randomBytesFn(4);
    return buff.toString('hex');
  }

  /**
   *
   * @param email
   * @param [instance]
   * @param [cb]
   *
   * @return {Promise}
   */
  AppUserAccount.requestVerificationEmail = async function (email, instance, cb) {
    try {
      if (process.env.USE_ACCOUNT_VERIFICATION) {
        if (_.isFunction(instance)) {
          cb = instance;
          instance = null;
        }

        if (_.isNil(instance)) {
          instance = await _AppUserAccount.findOne({where: {email: email}});
        }

        let token = await generateVerificationToken();

        let fakeGenerateVerificationToken = function (user, cb) {
          cb(null, token);
        };

        let options = {
          type: 'email',
          to: instance.email,
          from: process.env.FROM_ACCOUNT_VERIFICATION_EMAIL,
          generateVerificationToken: fakeGenerateVerificationToken,
          subject: 'Bienvenido a Mutual.',
          token: token,
          uid: instance.id,
          template: path.resolve(__dirname, '../../server/views/verify.ejs'),
          user: instance
        };

        let verifyFn = Promise.promisify(instance.verify, {context: instance});
        await verifyFn(options);
        return ResponseHelper.successHandler({}, cb);
      }
    } catch (err) {
      ResponseHelper.errorHandler(err, cb);
    }
  };
  _AppUserAccount.remoteMethod('requestVerificationEmail', {
    http: {
      verb: 'get'
    },
    accepts: [
      {arg: 'email', type: 'string'}
    ]
  });

  _AppUserAccount.observe('after save', async function (ctx, next) {
    try {
      if (ctx.isNewInstance) {
        let instance = ctx.instance;
        let createDataFn = Promise.promisify(instance.data.create, {context: instance.data});
        await createDataFn({});

        AppUserAccount.requestVerificationEmail(instance.email, instance);
      }
      next();
    } catch (err) {
      next(err);
    }
  });


  function AppUserAccount() {
  }
};
