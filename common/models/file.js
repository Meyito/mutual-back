'use strict';
module.exports = function (File) {

  const _ = require('lodash');

  File.afterRemote('getFiles', function (context, remoteMethodOutput, next) {
    _.remove(context.result, (file) => file.name === '.gitkeep');
    next();
  });

};
