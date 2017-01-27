'use strict';

module.exports = function (_Alertmeter) {
  const BuildHelper = require('../../server/build-helper');
  const app = require('../../server/server');
  const _ = require('lodash');

  let AppConstant;

  BuildHelper
    .build(Alertmeter, _Alertmeter)
    .then(function () {
      AppConstant = app.models.AppConstant;
    });

  Alertmeter.calculate = async function (childCharacteristics) {
    let totalweight = 0;
    let dividend = _.reduce(childCharacteristics, function (accum, childChar) {
      let weight = childChar.characteristic().weight;

      totalweight += weight;
      return childChar.statusValue * weight;
    }, 0);
    return totalweight === 0 ? 0 : dividend / totalweight;
  };

  function Alertmeter() {

  }
};
