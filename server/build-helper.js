'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

const app = require('./server');

function BuildHelper() {
}

BuildHelper.assing = function (Base, Model) {
  _.assign(Model, Base);
  _.assign(Model.prototype, Base.prototype);
};

/**
 *
 * @param Base
 * @param Model
 * @return {Promise}
 */
BuildHelper.build = function (Base, Model) {
  return new Promise(function (resolve, reject) {
    app.once('started', function () {
      BuildHelper.assing(Base, Model);
      resolve();
    });
  });
};

/**
 * BuildHelper class exists to allow you to effectively use the Webstorm autocomplementation tools.
 * @constructor
 */
module.exports = BuildHelper;
