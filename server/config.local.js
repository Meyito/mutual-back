/**
 * Created by garusis on 19/01/17.
 */

const path = require('path')

exports.push = {
  gcm: {
    id: process.env.PUSH_GCM_API_KEY
  },
  apn: {
    token: {
      key: path.join(process.cwd(), 'certs/key.p8'),
      keyId: process.env.APN_KEY_ID,
      teamId: process.env.APN_TEAM_ID
    }
  }
}

exports.knex = {
  client: 'pg',
  connection: `postgres://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}`,
  searchPath: 'knex,public',
  pool: {min: 0, max: Number(process.env.DATABASE_POOL_MAX) || 10}
}
