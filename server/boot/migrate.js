'use strict';
/**
 * Created by garusis on 25/11/16.
 */
module.exports = async function (app) {

  const fs = require('fs');
  const _ = require('lodash');
  const Promise = require('bluebird');

  let models = app.models;

  let dataSources = [
    {
      ds: app.dataSources.db,
      type: 'migrate'
    }
  ];

  if (process.env.MIGRATE_PERSISTENCE) {
    dataSources.push({
      ds: app.dataSources.database,
      type: 'migrate'
    });
  }

  function loadSeedData(Model) {
    const seederBasePath = './seeds';
    try {
      return require(`${seederBasePath}/${Model.definition.name}`);
    }
    catch (err) {
      return [];
    }
  }

  async function seedModel(Model, data) {
    console.log(`Seeding ${Model.definition.name} model.`);
    let dataToSeed = data || await loadSeedData(Model);
    if (_.isArray(dataToSeed) && dataToSeed.length > 0) {
      try {
        await Model.create(dataToSeed);
      } catch (err) {
        console.error(err);
      }
    }
    console.log(`End seed of ${Model.definition.name} model.`);
  }

  async function migrate(dsDescriptor) {
    let migrateMethod = process.env.MIGRATE_METHOD === 'update' ? dsDescriptor.ds.autoupdate : dsDescriptor.ds.automigrate;
    migrateMethod = Promise.promisify(migrateMethod, {context: dsDescriptor.ds});
    let modelsInDS = _.filter(models, (Model) => Model.dataSource && Model.dataSource.name === dsDescriptor.ds.name);
    let modelsToMigrate = _.filter(modelsInDS, function (Model) {
      return !_.includes(modelsInDS, Model.base);
    });

    console.log(`Start migration of ${dsDescriptor.ds.name} datasource`);
    try {
      await migrateMethod(_.map(modelsToMigrate, (Model) => Model.definition.name));
    } catch (err) {
      //console.error(err);
    }
    console.log(`Finish ${dsDescriptor.ds.name}`);

    modelsInDS = _.sortBy(modelsInDS, (Model) => _.isNil(Model.definition.settings.migrateOrder) ? -1 : Model.definition.settings.migrateOrder);
    for (let i = 0, length = modelsInDS.length; i < length; i++) {
      try {
        await seedModel(modelsInDS[i]);
      } catch (err) {
        console.error(err)
      }
    }
  }

  for (let i = 0, length = dataSources.length; i < length; i++) {
    await migrate(dataSources[i]);
  }
  app.emit('migrated');
};
