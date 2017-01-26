/**
 * Created by garusis on 25/01/17.
 */
'use strict';
/**
 * Created by garusis on 25/01/17.
 */
const request = require('request')
const argv = require('yargs').argv

const credentials = {
  "username": "cronexecuteaccount",
  "password": "rYEec+pYoQ77o0yU76TblIa9HDTZHtAFDzVUdEEehVC1I35UG2cC/hqPw"
};

const utilEndpoint = {
  login: 'cron-accounts/login',
  logout: 'cron-accounts/logout'
}

const cronEndpoints = {
  assignChallenges: 'children/assign-challenges'
};

let hostBase = `${process.env.APP_HOST_BASE_URL}/api`;
if (argv.host) {
  hostBase = argv.host;
}

let pathCron = cronEndpoints[argv.cron];
if (!pathCron) process.exit(0);


console.log(`Started ${argv.cron} Cron`);
request.post(`${hostBase}/${utilEndpoint.login}`, {form: credentials, json: true}, function (err, response, body) {
  console.log('Status login', response.statusCode)
  if (err) return console.error('Error login', err)

  let token = body.id;
  console.log(`${hostBase}/${pathCron}`)
  request.get(`${hostBase}/${pathCron}?access_token=${token}`, {json: true}, function (err, response, body) {
    console.log('Status Cron', response.statusCode)
    if (err) console.error('Error Cron', err)
    request.post(`${hostBase}/${utilEndpoint.logout}?access_token=${token}`, {json: true}, function (err, response, body) {
      console.log('Status Logout', response.statusCode)
      if (err) console.error('Error logout', err)
      process.exit(0)
    });
  });
});
