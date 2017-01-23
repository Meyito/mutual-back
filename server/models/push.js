'use strict';

module.exports = function (_Push) {

  const _ = require('lodash')
  const PushNotifications = require('node-pushnotifications');

  const app = require('../server');
  const BuildHelper = require('../../server/build-helper');
  const pn = new PushNotifications(app.get('push'));

  let AccessTokenAccount;
  BuildHelper
    .build(Push, _Push)
    .then(function () {
      AccessTokenAccount = app.models.AccessTokenAccount
    });

  Push.send = async function (userTarget, notification) {
    let registrationIds
    if (_.isString(userTarget)) {
      registrationIds = [userTarget]
    } else {
      registrationIds = await AccessTokenAccount({
        where: {userId: userTarget.id, registrationIds: {neq: ''}},
        fields: {registrationId: true}
      })
      registrationIds = _.map(registrationIds, 'registrationId')
    }
    return await pn.send(registrationIds, notification)
  }

  Push.sendNotification = function (registrationId, notification, cb) {
    Push
      .send(registrationId, notification)
      .then(function (results) {
        cb(null, results);
      })
      .catch(cb)
  }
  _Push.remoteMethod('sendNotification', {
    http: {
      path: '/send-notification',
      verb: 'post'
    },
    accepts: [
      {arg: 'registrationId', type: 'string'},
      {arg: 'notification', type: 'object'}
    ],
    returns: {type: 'object', root: true}
  });

  function Push() {
  }

};
