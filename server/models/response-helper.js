'use strict';


/**
 * @param {ResponseHelper} Model
 */
module.exports = function (Model) {
  const Promise = require('bluebird');

  const app = require('../server');
  const BuildHelper = require('../build-helper');

  ResponseHelper.successHandler = function (response, cb) {
    if (cb) process.nextTick(() => cb(null, response));
    return Promise.resolve(response);
  };

  ResponseHelper.errorHandler = function (err, cb) {
    if (cb) process.nextTick(() => cb(err));
    throw err;
  };

  BuildHelper.build(ResponseHelper, Model);
  function ResponseHelper() {
  }
};
