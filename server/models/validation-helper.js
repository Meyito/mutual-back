'use strict';

module.exports = function (Validationhelper) {

  const _ = require('lodash');
  const Promise = require('bluebird');

  Validationhelper.validatesPresenceOf = function (field, inObject, Model) {
    let modelName = Model.definition.name;
    let value = inObject[field];

    if (!_.isNil(value)) {
      return Promise.resolve();
    }

    let error = new Error(`The \`${modelName}\` instance is not valid. Details: \`${field}\` can't be blank (value: ${value}).`);

    error.name = "ValidationError";
    error.status = 422;
    error.statusCode = 422;
    error.details = {
      "context": modelName,
      "codes": {},
      "messages": {}
    };
    error.details.codes[field] = [
      "presence"
    ];
    error.details.messages[field] = [
      "can't be blank"
    ];

    return Promise.reject(error);
  }

};
