'use strict';


module.exports = function (_AppConstant) {
  const _ = require('lodash');

  const app = require('../server');
  const BuildHelper = require('../build-helper');

  let ResponseHelper;

  let hasChanges = true;
  let constants = null;

  BuildHelper
    .build(AppConstant, _AppConstant)
    .then(function () {
      ResponseHelper = app.models.ResponseHelper;
    });

  AppConstant.load = async function () {
    constants = await _AppConstant.find({});
    constants = _.keyBy(constants, 'name');
    hasChanges = false;
  };

  AppConstant.getPublic = async function (cb) {
    try {
      let publicConstants = await _AppConstant.find({where: {isPublic: true}});
      return ResponseHelper.successHandler(publicConstants, cb);
    } catch (err) {
      ResponseHelper.errorHandler(err, cb);
    }
  };


  AppConstant.findConstant = async function (name, cb) {
    try {
      if (!constants) {
        await AppConstant.load();
      }
      return constants[name].value;
    } catch (err) {
      ResponseHelper.errorHandler(err, cb);
    }
  };

  _AppConstant.observe('after save', function (ctx, next) {
    hasChanges = true;
    next();
  });

  setInterval(async function () {
    if (!hasChanges) return;
    AppConstant.load();
  }, 60000);

  BuildHelper.assing(AppConstant, _AppConstant);

  function AppConstant() {
  }
};
