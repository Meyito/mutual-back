'use strict';

module.exports = function (CronAccount) {

  let app = require('../../server/server');

  CronAccount.observe('after save', async function (ctx, next) {
    if (ctx.isNewInstance) {
      let RoleMapping = app.models.RoleMapping;

      let role = await app.models.Role.findOne({name: 'cron_executer'});
      await role.principals.create({
        principalType: RoleMapping.USER,
        principalId: ctx.instance.id
      });
    }
    next();
  });

};
