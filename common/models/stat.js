'use strict'

module.exports = function (_Stat) {

  const Promise = require('bluebird')
  const _ = require('lodash')

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
   * @param {String} eventName
   * @param {Array} filter
   * @param {Function} cb
   * @return {Promise}
   */
  Stat.execQuery = async function (eventName, filter, cb) {
    try {
      let event = Event.EVENT_TYPES[eventName]
      let query = knex('event')

      for (let i = 0, length = filter.length, condition, field; i < length; i++) {
        condition = filter[i]

        field = _.find(event.fields, {name: condition.field})
        if (!field) {
          return ResponseHelper.errorHandler({
            status: 406,
            message: `The ${condition.field} field is not able to use for ${eventName} event`
          }, cb)
        }

        if (!_.includes(field.type.operators, condition.operator)) {
          return ResponseHelper.errorHandler({
            status: 406,
            message: `The ${condition.operator} operator is not able to use for ${condition.field} field in ${eventName} event`
          }, cb)
        }

        condition.value = parsers[field.type.name](condition.value, condition.operator)

        query.where(condition.field, condition.operator, condition.value)
        if (field.grupable && condition.group) {
          query.groupBy(condition.field)
        }
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
