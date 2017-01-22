/**
 * Created by garusis on 19/01/17.
 */

exports.push = {
  gcm: {
    id: process.env.PUSH_GCM_API_KEY
  },
  apn: {
    token: {
      key: './certs/key.p8',
      keyId: 'ABCD',
      teamId: 'EFGH',
    }
  }
}

exports.knex = {
  client: 'pg',
  connection: `postgres://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}`,
  searchPath: 'knex,public',
  pool: {min: 0, max: Number(process.env.DATABASE_POOL_MAX) || 10}
}
