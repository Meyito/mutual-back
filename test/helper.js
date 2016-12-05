/**
 * Created by garusis on 04/12/16.
 */
const chai = require('chai');
const _ = require('lodash');
const app = require('../dist/server/server');

global.should = chai.should();
global.expect = chai.expect;
global.assert = chai.assert;
global._ = _;
global.app = app;

app.on('migrated', function () {
  run();
});
