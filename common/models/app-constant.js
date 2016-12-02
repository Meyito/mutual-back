'use strict';


module.exports = function (Appconstant) {
  const Promise = require('bluebird');

  const app = require('../../server/server');

  /**
   * @type ErrorHelper
   */
  const ErrorHelper = app.models.ErrorHelper;


  let hasChanges = true;
  let constants = null;


  Appconstant.findConstant = async function (name, cb) {
    try {
      if (!constants) {
        constants = await Appconstant.find({});
        hasChanges = false;
      }
    } catch (err) {
      ErrorHelper.errorHandler(err, cb);
    }
  };

  Appconstant.observe('after save', function (ctx, next) {
    hasChanges = true;
    next();
  });

  setInterval(async function () {
    if (!hasChanges) return;

    constants = await Appconstant.find({});
    hasChanges = false;
  }, 60000)
};
