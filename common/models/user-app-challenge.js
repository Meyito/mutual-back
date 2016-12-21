'use strict';

module.exports = function(_UserAppChallenge) {

  const Promise = require('bluebird');
  const _ = require('lodash');

  const BuildHelper = require('../../server/build-helper');
  const app = require('../../server/server');

  const utils = require(`${process.cwd()}/node_modules/loopback/lib/utils`);

  let AppConstant;
  let Characteristic;
  let ResponseHelper;
  let ValidationHelper;

  BuildHelper
    .build(UserAppChallenge, _UserAppChallenge)
    .then(function () {


    });

  UserAppChallenge.prototype.complete = function () {

  };

  function UserAppChallenge() {
  }

};
