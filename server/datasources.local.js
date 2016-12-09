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
  },
  'mutualEmail': {
    'name': 'mutualEmail',
    'connector': 'mail',
    'transports': [{
      'type': 'SMTP',
      'host': process.env.SMTP_HOST,
      'secureConnection': process.env.SMTP_USE_SSL,
      'secure': process.env.SMTP_USE_SSL,
      'port': process.env.SMTP_PORT,
      'auth': {
        'user': process.env.SMPT_USER,
        'pass': process.env.SMPT_PASSWORD
      }
    }]
  }
};
