'use strict';
/**
 * Created by garusis on 25/11/16.
 */
module.exports = function (app) {
  if (!process.env.MIGRATE) {
    return;
  }

  const fs = require('fs');
  const _ = require('lodash');
  const Promise = require('bluebird');

  let models = app.models;

  let dataSources = [
    {
      ds: app.dataSources.db,
      type: 'migrate'
    },
    {
      ds: app.dataSources.database,
      type: 'migrate'
    }
  ];

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
    let dataToSeed = data || loadSeedData(Model);
    let createFunction = Promise.promisify(Model.create, {context: Model});
    await createFunction(dataToSeed);
    console.log(`End seed of ${Model.definition.name} model.`);
  }

  async function migrate(dsDescriptor) {
    let migrateMethod = process.env.MIGRATE_METHOD === 'update' ? dsDescriptor.ds.autoupdate : dsDescriptor.ds.automigrate;
    migrateMethod = Promise.promisify(migrateMethod, {context: dsDescriptor.ds});
    let modelsToMigrate = _.chain(models)
      .filter((Model) => Model.dataSource.name === dsDescriptor.ds.name && Model.definition.settings.__is_root__model__)
      .map((Model)=>Model.definition.name)
      .value();

    console.log(`Start migration of ${modelsToMigrate} datasource`);
    try {
      await migrateMethod(modelsToMigrate);
    } catch (err) {
      console.error(err);
    }
    console.log(`Finish ${dsDescriptor.ds.name}`);
  }

  (async function () {
    for (let i = 0, length = dataSources.length; i < length; i++) {
      await migrate(dataSources[i]);
    }

    for (let modelName in models) {
      await seedModel(models[modelName]);
    }
  })();
};
