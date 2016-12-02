'use strict';


/**
 * @param {ErrorHelper} Model
 */
module.exports = function (Model) {
  const _ = require('lodash');

  function ErrorHelper() {
  }

  ErrorHelper.prototype.errorHandler = function (err, cb) {
    process.nextTick(() => cb(err));
    throw err;
  };

  _.assign(Model, ErrorHelper.prototype);
};
