'use strict';
/**
 * Created by garusis on 27/11/16.
 */
module.exports = function (loopback) {
  persistedModelSetup(loopback.PersistedModel);
};

const _ = require('lodash');

const DataAccessObject = require(`${process.cwd()}/node_modules/loopback-datasource-juggler/lib/dao`);
const utils = require(`${process.cwd()}/node_modules/loopback/lib/utils`);

let functionList = [
  'create',
  'upsert',
  'patchOrCreate',
  'updateOrCreate',
  'upsertWithWhere',
  'patchOrCreateWithWhere',
  'replaceOrCreate',
  'findOrCreate',
  'exists',
  'findById',
  'findByIds',
  'find',
  'findOne',
  'destroyAll',
  'deleteAll',
  'remove',
  'deleteById',
  'destroyById',
  'removeById',
  'count',
  'updateAll',
  'update',
  'replaceById'
];

let prototypeFunctionList = [
  'save',
  'destroy',
  'delete',
  'remove',
  'updateAttribute',
  'replaceAttributes',
  'patchAttributes',
  'updateAttributes',
  'reload'
];

function generateSecureFunction(object, functionName) {
  let originalFunction = object[functionName];
  object[functionName] = function () {
    let args = Array.prototype.slice.call(arguments);
    let cb = arguments[args.length - 1];

    let callbackWasCalled = false;
    let secureFunction = function () {
      if (callbackWasCalled) return;
      callbackWasCalled = true;
      return cb.apply(this, arguments);
    };


    if (typeof cb === 'function') {
      args[args.length - 1] = secureFunction;
    } else {
      cb = utils.createPromiseCallback();
      args.push(secureFunction);
    }

    originalFunction.apply(this, args);
    return cb.promise;
  };
}

_.forEach(functionList, function (functionName) {
  generateSecureFunction(DataAccessObject, functionName);
});

_.forEach(prototypeFunctionList, function (functionName) {
  generateSecureFunction(DataAccessObject.prototype, functionName);
});

function persistedModelSetup(PersistedModel) {
  const oldSetup = PersistedModel.setup;

  function updateParent(ParentModel, newChildrenModelName) {
    let base = ParentModel.base;
    if (ParentModel.definition.settings.__children_models__) {
      ParentModel.definition.settings.__children_models__.push(newChildrenModelName);
      updateParent(base, newChildrenModelName);
    }
  }

  PersistedModel.setup = function () {
    const Model = this;

    Model.defineProperty("__model_name__", {
      type: String,
      index: true,
      default: Model.definition.name,
      hidden: true
    });

    if (!Model.definition.settings.hidden) {
      Model.definition.settings.hidden = [];
    }
    Model.definition.settings.hidden.push("__model_name__");
    Model.definition.settings.__children_models__ = [];
    updateParent(Model, Model.definition.name);

    Model.observe("access", function (ctx, next) {
      if (ctx.childrenModelsHasFiltered) {
        return next();
      }
      ctx.childrenModelsHasFiltered = true;
      const __children_models__ = ctx.Model.definition.settings.__children_models__;
      let or = __children_models__.map((model) => {
        return {__model_name__: model};
      });

      if (ctx.query.where) {
        ctx.query.where = {
          and: [
            {or: or},
            ctx.query.where
          ]
        };
      } else {
        ctx.query.where = {
          or: or
        };
      }
      next();
    });
    oldSetup.apply(Model, arguments);
  };
}
