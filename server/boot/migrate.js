'use strict';
/**
 * Created by garusis on 25/11/16.
 */
module.exports = function (app) {
  if (!process.env.MIGRATE) {
    return;
  }

  const fs = require('fs');
  const path = require('path');
  const _ = require('lodash');
  const async = require('async');
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
    let dataToSeed = data || loadSeedData(Model);
    let createFunction = Promise.promisify(Model.create, {context: Model});
    await createFunction(dataToSeed);
  }

  async function migrate(dsDescriptor) {
    let migrateMethod = process.env.MIGRATE_METHOD === 'update' ? dsDescriptor.ds.autoupdate : dsDescriptor.ds.automigrate;
    migrateMethod = Promise.promisify(migrateMethod, {context: dsDescriptor.ds});
    console.log(dsDescriptor.ds.name);
    await migrateMethod();

    for (let modelName in models) {
      let model = models[modelName];
      if (model.dataSource.name === dsDescriptor.ds.name) {
        await seedModel(model);
      }
    }
    console.log('finish '+dsDescriptor.ds.name);
  }

  (async function () {
    for (let i = 0, length = dataSources.length; i < length; i++) {
      await migrate(dataSources[i]);
    }
  })();
};
