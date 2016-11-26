'use strict';
/**
 * Created by garusis on 25/11/16.
 */
module.exports = function (app) {
  const fs = require('fs');
  const path = require('path');
  const _ = require('lodash');
  const async = require('async');
  const Promise = require('bluebird');


  const Role = app.models.Role;
  const RoleMapping = app.models.RoleMapping;
  const AdminAccount = app.models.AdminAccount;
  const Store = app.models.Store;
  const Category = app.models.Category;
  const ProductTemplate = app.models.ProductTemplate;
  const UtilData = app.models.UtilData;
  const memoryDataSource = app.dataSources.db;

  const loadSeedData = function (Model) {
    const seederBasePath = './seeds';
    return require(`${seederBasePath}/${Model.definition.name}`);
  };
  const seedModel = function (Model, data) {
    let dataToSeed = data || loadSeedData(Model);
    return new Promise(function (resolve, reject) {
      Model.create(dataToSeed, function (err, data) {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  };

  if (process.env.MIGRATE === 'true') {
    memoryDataSource.automigrate(function (err) {
      const mongodbDataSource = app.dataSources.database;
      mongodbDataSource.automigrate(function (err) {
        mongodbDataSource.autoupdate(function (err) {
          const Accounts = app.models.Accounts;

          seedModel(Role).then(function (roles) {
            app.emit("loadedRoles");
          });

          seedModel(AdminAccount).then(function (adminAccounts) {
          }).catch(function (err) {
          });

          seedModel(ProductTemplate).then(function (productTemplate) {
          }).catch(function (err) {
          });

          seedModel(Store).then(function (stores) {
          }).catch(function (err) {
          });

          seedModel(Category).then(function (stores) {
          }).catch(function (err) {
          });

          seedModel(UtilData).then(function (utils) {
          }).catch(function (err) {
          });
        });
      });
    });
  }
};
