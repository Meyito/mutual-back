'use strict';

/**
 *
 * @param {AppUserAccount} _AppUserAccount
 */
module.exports = function (_AppUserAccount) {
  const Promise = require('bluebird');

  const BuildHelper = require('../../server/build-helper');
  const app = require('../../server/server');

  let AppConstant;

  BuildHelper
    .build(AppUserAccount, _AppUserAccount)
    .then(function () {
      AppConstant = app.models.AppConstant;
    });

  _AppUserAccount.observe('after save', async function (ctx, next) {
    try {
      if (ctx.isNewInstance) {
        let instance = ctx.instance;
        let createDataFn = Promise.promisify(instance.data.create, {context: instance.data});
        await createDataFn({});
      }
      next();
    } catch (err) {
      next(err);
    }
  });


  function AppUserAccount() {
  }
};
