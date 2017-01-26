'use strict';

module.exports = function (AdminAccount) {

  let app = require('../../server/server');

  AdminAccount.observe('after save', async function (ctx, next) {
    if (ctx.isNewInstance) {
      let RoleMapping = app.models.RoleMapping;

      let role = await app.models.Role.findOne({where:{name: 'admin'}});
      await role.principals.create({
        principalType: RoleMapping.USER,
        principalId: ctx.instance.id
      });
    }
    next();
  });

};
