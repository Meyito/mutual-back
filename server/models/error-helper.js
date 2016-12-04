'use strict';


/**
 * @param {ErrorHelper} Model
 */
module.exports = function (Model) {
  const app = require('../server');
  const BuildHelper = app.models.BuildHelper;

  ErrorHelper.errorHandler = function (err, cb) {
    process.nextTick(() => cb(err));
    throw err;
  };

  BuildHelper.assing(ErrorHelper, Model);
  function ErrorHelper() {
  }
};
