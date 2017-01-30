'use strict';

module.exports = function (_Push) {

  const _ = require('lodash')
  const PushNotifications = require('node-pushnotifications');

  const app = require('../server');
  const BuildHelper = require('../../server/build-helper');
  const pn = new PushNotifications(app.get('push'));

  let AccessTokenAccount;
  let DH
  BuildHelper
    .build(Push, _Push)
    .then(function () {
      AccessTokenAccount = app.models.AccessTokenAccount
      DH = app.models.DebugHelper
    });

  Push.send = async function (userTarget, notification) {
    try {
      let registrationIds
      if (_.isString(userTarget)) {
        registrationIds = [userTarget]
      } else {
        registrationIds = await AccessTokenAccount.find({
          where: {userId: userTarget.id, registrationId: {neq: ''}},
          fields: {registrationId: true}
        })
        registrationIds = _.map(registrationIds, 'registrationId')
      }
      return await pn.send(registrationIds, notification)
    } catch (err) {
      DH.debug.error("Notification can't be sent")
      DH.debug.error(notification)
      DH.debug.error(err)
    }
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
