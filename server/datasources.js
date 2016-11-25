'use strict';
module.exports = {
  'db': {
    'name': 'db',
    'connector': 'memory'
  },
  'database': {
    'url': process.env.DATABASE_URL,
    'name': 'database',
    'connector': 'postgresql'
  }
};
