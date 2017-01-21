'use strict';

/**
 * Created by garusis on 08/12/16.
 */
module.exports = function (Model, options) {
  // Model is the model class
  // options is an object containing the config properties from model definition
  Model.defineProperty('created', {type: Date, default: '$now', index: true});
  Model.defineProperty('modified', {type: Date, default: '$now', index: true});

  Model.observe('before save', function event(ctx, next) { //Observe any insert/update event on Model
    let data = ctx.instance || ctx.data;
    if (ctx.isNewInstance) {
      data.created = Date.now();
    }
    data.modified = Date.now();
    next();
  });

};
