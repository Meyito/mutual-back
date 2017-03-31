'use strict';

let path = require('path');

let datasources = {
  'database': {
    'host': process.env.DATABASE_HOST || process.env.HOSTNAME || "127.0.0.1",
    'database': process.env.DATABASE_NAME,
    'username': process.env.DATABASE_USERNAME,
    'password': process.env.DATABASE_PASSWORD,
    'max': Number(process.env.DATABASE_POOL_MAX) || 10,
    'name': 'database',
    'connector': 'postgresql'
  },
  'files': {
    name: 'files',
    connector: 'loopback-component-storage',
    provider: 'filesystem',
    root: process.env.PATH_FILES || path.join(process.cwd(), 'storage'),
    getFilename: function (origFilename) {
      origFilename = origFilename.name;
      let parts = origFilename.split('.');
      let extension = parts[parts.length - 1];

      return Date.now() + '_' + parts[parts.length - 2] + '.' + extension;
    }
  }
};
module.exports = datasources;
