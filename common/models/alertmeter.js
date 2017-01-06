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

  Alertmeter.calculate = async function (characteristics) {
    let totalweight = 0;
    let dividend = _.reduce(characteristics, function (accum, elem) {
      let weight = elem.characteristic().weight;

      totalweight += weight;
      return elem.statusValue * weight;
    }, 0);
    return totalweight === 0 ? 0 : dividend / totalweight;
  };

  function Alertmeter() {

  }
};
