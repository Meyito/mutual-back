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
  //TODO: fix utils
  const utils = require('../../node_modules/loopback/lib/utils');

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
          if (!instance) return ResponseHelper.errorHandler({
            status: 404,
            message: 'Email isn\'t registered for any user'
          }, cb);
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
        await instance.verify(options);
      }
      return ResponseHelper.successHandler({}, cb);
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

  let oldCreate = _AppUserAccount.create;
  _AppUserAccount.create = function (data, callback) {
    callback = callback || utils.createPromiseCallback();

    let municipalityId = data.municipalityId;
    delete data.municipalityId;

    let cbErr;
    if (callback) {
      cbErr = function (err) {
        if (err) callback
      };
    }

    let createCreateData = function () {
      return this.data.create({municipalityId: municipalityId});
    };

    let promise = oldCreate.call(this, data, cbErr);
    if(callback){

    }else{
      return promise.then(() => createCreateData.call(this))
    }
    return callback.promise;
  };

  _AppUserAccount.observe('after save', async function (ctx, next) {
    try {
      let instance = ctx.instance || ctx.data;
      if (ctx.isNewInstance) {
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
