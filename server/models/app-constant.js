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
    if (!hasChanges) return;

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
  _AppConstant.remoteMethod('getPublic', {
    http:{
      verb: 'get'
    },
    accepts: [],
    returns: {root: true, type: 'array'}
  });


  /**
   *
   * @param name
   * @param [cb]
   */
  AppConstant.findConstant = async function (name, cb) {
    try {
      await AppConstant.load();
      return ResponseHelper.successHandler(constants[name].value, cb);
    } catch (err) {
      ResponseHelper.errorHandler(err, cb);
    }
  };

  _AppConstant.observe('persist', function (ctx, next) {
    hasChanges = true;
    next();
  });

  _AppConstant.observe('after delete', function (ctx, next) {
    hasChanges = true;
    next();
  });

  BuildHelper.assing(AppConstant, _AppConstant);

  function AppConstant() {
  }
};
