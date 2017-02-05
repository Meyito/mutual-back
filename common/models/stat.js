'use strict'

module.exports = function (_Stat) {

  const Promise = require('bluebird')
  const _ = require('lodash')
  const fs = require("fs")
  const path = require("path")
  const xlsx = require("node-xlsx")
  const moment = require("moment")
  const XlsxTemplate = require('xlsx-template');

  const utils = require(`${process.cwd()}/node_modules/loopback/lib/utils`)

  const BuildHelper = require('../../server/build-helper')
  const app = require('../../server/server')

  const parsers = {}

  parsers.date = function (str, operator) {
    return new Date(str)
  }
  parsers.number = parsers.reference = function (str, operator) {
    return _.toNumber(str)
  }

  let knex;
  let Event;
  let ResponseHelper;
  let DH;

  BuildHelper
    .build(Stat, _Stat)
    .then(function () {
      knex = app.knex

      Event = app.models.Event
      ResponseHelper = app.models.ResponseHelper
      DH = app.models.DebugHelper;
    })

  /**
   *
   * @param {Object} res
   * @param {Array} events
   * @return {Promise}
   */
  Stat.execQueriesToFile = function (events, res, cb) {
    let promises = _.map(events, function (event) {
      let eventName = event.eventName
      let filter = event.filter

      return Stat.execQuery(eventName, filter)
        .then(function (count) {
          event.count = count
          return Event.pretty(event)
        })
    })

    Promise.all(promises)
      .then(function (queries) {
        fs.readFile(path.join(__dirname, '..', "..", "server", "views", 'stats.xlsx'), function (err, data) {
          if (err) return cb(err)

          let template = new XlsxTemplate(data);
          let sheetNumber = 1;

          let values = {
            extractDate: moment().format("ll"),
            queries: queries
          };

          template.substitute(sheetNumber, values);

          data = template.generate({type: 'nodebuffer'});
          res.writeHead(200, {'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
          res.end(data, 'binary');
        })
      })
  }
  _Stat.remoteMethod('execQueriesToFile', {
    accepts: [
      {arg: 'events', type: 'array'},
      {arg: 'res', type: 'object', http: {source: 'res'}}
    ],
    http: {
      verb: 'get',
      path: '/exec-queries-to-file'
    }
  })

  /**
   *
   * @param {String} eventName
   * @param {Array} filter
   * @param {Function} cb
   * @return {Promise}
   */
  Stat.execQuery = async function (eventName, filter, cb) {
    try {
      let event = Event.EVENT_TYPES[eventName]
      if (!event) {
        return ResponseHelper.errorHandler({
          status: 406,
          message: `The ${eventName} event is not able to use`
        }, cb)
      }


      let query = knex('event')

      query.where("type", "=", eventName)

      let groupBy = [];
      for (let i = 0, length = filter.length, condition, field; i < length; i++) {
        condition = filter[i]

        field = _.find(event.fields, {name: condition.field})
        if (!field) {
          return ResponseHelper.errorHandler({
            status: 406,
            message: `The ${condition.field} field is not able to use for ${eventName} event`
          }, cb)
        }

        if (condition.operator) {
          if (!_.includes(field.type.operators, condition.operator)) {
            return ResponseHelper.errorHandler({
              status: 406,
              message: `The ${condition.operator} operator is not able to use for ${condition.field} field in ${eventName} event`
            }, cb)
          }

          condition.value = parsers[field.type.name](condition.value, condition.operator)
          query.where(condition.field, condition.operator, condition.value)
        }

        if (field.grupable && condition.group) {
          query.groupBy(condition.field)
          groupBy.push(condition.field);
        }
      }
      if (groupBy.length > 0) {
        _.forEach(Event.COMMON_FIELDS, function (field) {
          if (!_.includes(groupBy, field.name)) {
            query.max(field.name);
          }
        })
      }


      let result = await knex.count('*').from(query.as('conditions'))
      result = result[0]
      return ResponseHelper.successHandler(result.count, cb)
    } catch (err) {
      ResponseHelper.errorHandler(err, cb)
    }
  }
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
  })


  Stat.getEventTypes = function (cb) {
    cb(null, Event.EVENT_TYPES);
  }
  _Stat.remoteMethod('getEventTypes', {
    http: {
      verb: 'get',
      path: '/event-types'
    },
    accepts: [],
    returns: [{
      root: true, type: 'object'
    }]
  })


  function Stat() {
  }
}
