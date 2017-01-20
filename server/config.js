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
