'use strict';

/**
 * @param {BuildHelper} Model
 */
module.exports = function (Model) {
  const _ = require('lodash');

  /**
   * BuildHelper class exists to allow you to effectively use the Webstorm autocomplementation tools.
   * @constructor
   */
  function BuildHelper() {
  }

  BuildHelper.assing = function (Base, Model) {
    _.assign(Model, Base);
    _.assign(Model.prototype, Base.prototype);
  };

  BuildHelper.assing(BuildHelper, Model);
};
