'use strict';

module.exports = function (DebugHelper) {
  const debug = require('debug')

  DebugHelper.create = function (namespace) {
    namespace = 'string' === typeof namespace ? namespace : namespace.definition.name
    return debug(`mutual:${namespace}`)
  }

  DebugHelper.debug = {
    test: DebugHelper.create('test'),
    production: DebugHelper.create('production'),
    development: DebugHelper.create('development'),
    staging: DebugHelper.create('staging'),
    error: DebugHelper.create('error'),
    info: DebugHelper.create('info')
  }

};
