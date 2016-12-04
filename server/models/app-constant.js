'use strict';


module.exports = function (_AppConstant) {
  const _ = require('lodash');

  const app = require('../server');
  const ErrorHelper = app.models.ErrorHelper;
  const BuildHelper = app.models.BuildHelper;


  let hasChanges = true;
  let constants = null;

  AppConstant.load = async function () {
    constants = await _AppConstant.find({});
    constants = _.keyBy(constants, 'name');
    hasChanges = false;
  };


  AppConstant.findConstant = async function (name, cb) {
    try {
      if (!constants) {
        await AppConstant.load();
      }
      return constants[name].value;
    } catch (err) {
      ErrorHelper.errorHandler(err, cb);
    }
  };

  AppConstant.observe('after save', function (ctx, next) {
    hasChanges = true;
    next();
  });

  setInterval(async function () {
    if (!hasChanges) return;
    AppConstant.load();
  }, 60000);


  function AppConstant() {
  }

  BuildHelper.assing(AppConstant, _AppConstant)
};
