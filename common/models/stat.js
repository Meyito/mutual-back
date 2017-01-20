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

  const commonOperators = {
    lt: 'lt',
    gt: 'gt',
    lte: 'lte',
    gte: 'gte',
    eq: 'eq',
    uniq: 'uniq'
  }
  let co = commonOperators

  const dataType = {
    date: {name: 'date', operators: [co.eq, co.gt, co.lt, co.gte, co.lte]},
    number: {name: 'number', operators: [co.eq, co.gt, co.lt, co.gte, co.lte]},
    reference: {name: 'reference', operators: [co.eq]},
    noop_reference: {name: 'reference', operators: []}
  };

  const commonFields = {
    created: {
      name: 'created',
      label: 'creado',
      type: dataType.date,
      grupable: false
    },
    municipalityId: {
      name: 'municipalityId',
      label: 'municipio',
      type: dataType.reference,
      grupable: false
    },
    genderId: {
      name: 'genderId',
      label: 'genero',
      type: dataType.reference,
      grupable: false
    },
    userId: {
      name: 'userId',
      label: 'usuario',
      type: dataType.noop_reference,
      grupable: false
    }
  }
  let cf = commonFields

  const eventTypes = {
    signup: {
      name: 'signup',
      fields: [cf.created, cf.municipalityId, cf.genderId]
    }
  };

  BuildHelper
    .build(Stat, _Stat)
    .then(function () {
    });


  Stat.getEventTypes = function (cb) {
    cb(eventTypes);
  };
  _Stat.remoteMethod('getEventTypes', {
    http: {
      verb: 'get',
      path: 'event-types'
    },
    accepts: []
  });


  function Stat() {
  }
};
