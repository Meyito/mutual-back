'use strict';

module.exports = function (_Stat) {

  const Promise = require('bluebird');
  const _ = require('lodash');

  const utils = require(`${process.cwd()}/node_modules/loopback/lib/utils`);

  const BuildHelper = require('../../server/build-helper');
  const app = require('../../server/server');

  const parsers = {}

  parsers.date = function (str) {
    return new Date(str)
  }
  parsers.number = parsers.reference = function (str) {
    return _.toNumber(str)
  }

  let Event;

  BuildHelper
    .build(Stat, _Stat)
    .then(function () {
      Event = app.models.Event;

    });

  Stat.execQuery = function (cb) {
    cb(null, Event.EVENT_TYPES);
  };
  _Stat.remoteMethod('execQuery', {
    http: {
      verb: 'post',
      path: '/exec-query'
    },
    accepts: [
      {arg: 'eventName', type: 'string', required: true},
      {arg: 'filter', type: 'array', required: true}
    ],
    returns: [{
      root: true, type: 'object'
    }]
  });


  Stat.getEventTypes = function (cb) {
    cb(null, Event.EVENT_TYPES);
  };
  _Stat.remoteMethod('getEventTypes', {
    http: {
      verb: 'get',
      path: '/event-types'
    },
    accepts: [],
    returns: [{
      root: true, type: 'object'
    }]
  });


  function Stat() {
  }
};
