'use strict';
/**
 * Created by garusis on 27/11/16.
 */
module.exports = function (loopback) {
  persistedModelSetup(loopback.PersistedModel);
};

const DataAccessObject = require(`${process.cwd()}/node_modules/loopback-datasource-juggler/lib/dao`);
const oldSave = DataAccessObject.prototype.save;
DataAccessObject.prototype.save = function (options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  let callbackWasCalled = false;
  return oldSave.call(this, options, function (err, res) {
    if (callbackWasCalled) return;
    callbackWasCalled = true;
    return cb.call(this, err, res);
  });
};


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
