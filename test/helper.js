/**
 * Created by garusis on 04/12/16.
 */
const chai = require('chai');
const _ = require('lodash');
const Promise = require('bluebird');
const moment = require('moment');
const app = require('../dist/server/server');

global.should = chai.should();
global.expect = chai.expect;
global.assert = chai.assert;
global.BPromise = Promise;
global.moment = moment;
global._ = _;
global.app = app;

global.MathUtils = {
  randomNumber: function (max, min) {
    min = min || 0
    max = max || 10
    return min + Math.floor(Math.random() * (max - min + 1))
  }
}

app.on('migrated', function () {
  run();
});
