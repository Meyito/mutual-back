'use strict';
module.exports = {
  'database': {
    'host': process.env.DATABASE_HOST,
    'database': process.env.DATABASE_NAME,
    'username': process.env.DATABASE_USERNAME,
    'password': process.env.DATABASE_PASSWORD,
    'max': Number(process.env.DATABASE_POOL_MAX),
    'name': 'database',
    'connector': 'postgresql'
  }
};
