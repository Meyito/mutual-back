'use strict';

module.exports = function (_Level) {
  const BuildHelper = require('../../server/build-helper');
  const app = require('../../server/server');

  let AppConstant;

  BuildHelper
    .build(Level, _Level)
    .then(function () {
      AppConstant = app.models.AppConstant;
    });

  Level.calculate = async function (exp) {
    let baseExpLvl = Number(await AppConstant.findConstant('base_experience_by_lvl'));
    let maxLevelIncrement = Number(await AppConstant.findConstant('max_level_increment'));

    let lvl = 1, maxExpInLvl = baseExpLvl, lastExp = 0;

    while (lvl < maxLevelIncrement) {
      if (exp < maxExpInLvl) {
        break;
      }
      lastExp = maxExpInLvl;
      maxExpInLvl += baseExpLvl * ++lvl;
    }

    while (exp > maxExpInLvl) {
      lastExp = maxExpInLvl;
      maxExpInLvl += baseExpLvl * maxLevelIncrement;
      ++lvl;
    }
    return {
      current: lvl,
      currentExp: exp - lastExp,
      next: lvl + 1,
      requiredExp: maxExpInLvl - lastExp
    };
  };


  /**
   * @constructor
   */
  function Level() {
  }
};
