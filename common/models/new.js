'use strict';

module.exports = function (_New) {

  const Promise = require('bluebird');
  const _ = require('lodash');
  const request = require("request");
  const pickup = require("pickup");

  const BuildHelper = require('../../server/build-helper');
  const app = require('../../server/server');

  let ResponseHelper;
  let RSSResource;


  BuildHelper
    .build(New, _New)
    .then(function () {
      ResponseHelper = app.models.ResponseHelper;
      RSSResource = app.models.RSSResource;
    });

  New.loadRSSResource = function (resource) {

    let entries = [];

    let stream = request
      .get(resource)
      .pipe(pickup({eventMode: true}));

    stream.on('entry', function (entry) {
      entries.push(entry);
    });

    return new Promise(function (resolve, reject) {
      let _error;
      stream.on('error', function (error) {
        _error = error;
      });

      stream.on('finish', function () {
        if (_error) return reject(_error);
        resolve(entries);
      });
    });
  };

  New.collectRSSResources = function (resources) {
    return Promise.all(_.map(resources, (resource) => New.loadRSSResource(resource.source)));
  };

  New.getLastest = async function (cb) {
    let sources = await RSSResource.find({});
    let newsInResources = await New.collectRSSResources(sources);
    newsInResources = _.chain(newsInResources).flatten().sortBy((entry) => -(new Date(entry.updated).getTime())).values();

    try {
      return ResponseHelper.successHandler(newsInResources, cb);
    } catch (err) {
      ResponseHelper.errorHandler(err, cb);
    }
  };
  _New.remoteMethod('getLastest', {
    http: {
      verb: 'get',
      path: '/get-lastest'
    },
    accepts: [],
    returns: [{root: true, type: 'array'}]
  });


  function New() {
  }

};
