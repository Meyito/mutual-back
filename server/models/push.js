'use strict';

module.exports = function(Push) {

  const app = require('../server');

  const PushNotifications = require('node-pushnotifications');
  const pn = new PushNotifications(app.get('push'));

  Push.sendNotification = function (userTarget, notification) {
  }


};
