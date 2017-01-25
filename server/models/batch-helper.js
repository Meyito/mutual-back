'use strict';

module.exports = function (_BashHelper) {
  const debug = require('debug')
  const _ = require('lodash')
  const Promise = require('bluebird')

  const BuildHelper = require('../../server/build-helper');

  let DH;

  let defaultBatchSize = 50

  BuildHelper
    .build(BashHelper, _BashHelper)
    .then(function () {
      DH = app.models.DebugHelper;
    })


  /**
   * Exec eachCb for each item that match with filter in batch. This method call to Model.find method without skip filter
   * for get each batch so only use it when filter.where have conditions that validates that items in a batch don't
   * collide with items in another batch.
   * @param Model
   * @param where
   * @param [options]
   * @param [batchSize]
   * @param eachCb
   */
  BashHelper.applyToNoRepetibleList = async function (Model, where, options, batchSize, eachCb) {
    if(_.isFunction(options)){
      eachCb = options
      options = null
      batchSize = null
    }

    if(_.isFunction(batchSize)){
      eachCb = batchSize
      batchSize = null
    }

    let filter = {
      limit: batchSize || defaultBatchSize,
      where
    }

    let batch
    while ((batch = await Model.find(filter, options)).length > 0) {
      await execOnBatch(batch, eachCb);
    }
  }

  /**
   * Exec eachCb for each item that match with filter in batch. This method call to Model.find method with skip filter
   * for get each batch so use it when the results size's list don't change in each call to Model.find.
   * @param Model
   * @param filter
   * @param options
   * @param batchSize
   * @param eachCb
   */
  BashHelper.applyToRepetibleList = async function (Model, filter, options, batchSize, eachCb) {
    if(_.isFunction(options)){
      eachCb = options
      options = null
      batchSize = null
    }

    if(_.isFunction(batchSize)){
      eachCb = batchSize
      batchSize = null
    }

    let filter = {
      limit: batchSize || defaultBatchSize,
      where,
      skip: 0
    }

    let batch
    while ((batch = await Model.find(filter, options)).length > 0) {
      filter.skip += filter.limit
      await execOnBatch(batch, eachCb);
    }
  }

  function execOnBatch(batch, eachCb) {
    if (eachCb.length === 2) {
      eachCb = Promise.promisify(eachCb)
    }
    let promises = _.map(batch, function (item) {
      return eachCb(item)
        .catch((err) => DH.debug.error(err))
    })
    return Promise.all(promises)
  }

  function BashHelper() {

  }

};
