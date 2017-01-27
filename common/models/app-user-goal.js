'use strict';

module.exports = function (_AppUserGoal) {

  const BuildHelper = require('../../server/build-helper');
  let app = require('../../server/server');

  let DH
  let Push
  let Goal

  BuildHelper
    .build(AppUserGoal, _AppUserGoal)
    .then(function () {
      DH = app.models.DebugHelper
      Push = app.models.Push
      Goal = app.models.Goal
    })

  _AppUserGoal.observe('after save', async function (ctx, next) {
    if (ctx.isNewInstance) {
      let instance = ctx.instance;

      Goal.findOne({where: {id: instance.goalId}, include: 'category'})
        .then(function (goal) {
          if (!goal) return;

          Push.send({id: instance.userId}, {
            title: "¡Felicidades! Has conseguido un nuevo logro",
            body: `Has conseguido la medalla ${goal.category().name} ` + (goal.name ? `(${goal.name})` : '')
          });
        })
        .catch((err) => DH.debug.error(err))
    }
    next();
  });

  function AppUserGoal() {
  }

};
