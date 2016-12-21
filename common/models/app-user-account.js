'use strict';
/**
 *
 * @param {AppUserAccount} _AppUserAccount
 */
module.exports = function (_AppUserAccount) {
  const Promise = require('bluebird');
  const path = require('path');
  const crypto = require('crypto');
  const _ = require('lodash');

  const utils = require(`${process.cwd()}/node_modules/loopback/lib/utils`);

  const BuildHelper = require('../../server/build-helper');
  const app = require('../../server/server');

  let AppConstant;
  let AppUserData;
  let Level;
  let ResponseHelper;
  let ValidationHelper;

  BuildHelper
    .build(AppUserAccount, _AppUserAccount)
    .then(function () {
      AppConstant = app.models.AppConstant;
      AppUserData = app.models.AppUserData;
      ResponseHelper = app.models.ResponseHelper;
      ValidationHelper = app.models.ValidationHelper;
      Level = app.models.Level;

      let oldCreate = _AppUserAccount.create;
      _AppUserAccount.create = function (data) {
        let callback = arguments[arguments.length - 1];
        callback = _.isFunction(callback) ? callback : utils.createPromiseCallback();

        let modifiableData = AppUserData.getModifiableFiels();
        ValidationHelper
          .validatesPresenceOf('municipalityId', data.data, _AppUserAccount)
          .then(() => {
            let userData = _.pick(data.data, modifiableData);
            delete data.data;

            oldCreate.call(this, data, function (err, newInstance) {
              if (err) return callback(err);
              newInstance.data.create(userData, function (err, data) {
                callback(err, newInstance);
              });
            });
          })
          .catch(function (err) {
            callback(err);
          });


        return callback.promise;
      };

      let oldFindById = _AppUserAccount.findById;
      _AppUserAccount.findById = function (id, filter, callback) {
        if (!callback) {
          if (_.isFunction(filter)) {
            callback = filter;
            filter = null;
          } else {
            callback = callback || utils.createPromiseCallback();
          }
        }

        if (!filter) {
          filter = {};
        }

        if (!filter.include) {
          filter.include = [];
        } else if (!_.isArray(filter.include)) {
          filter.include = [filter.include];
        }
        filter.include.push('data');

        oldFindById
          .call(this, id, filter)
          .then(function (newInstance) {
            if (!newInstance) return callback(null, newInstance);

            return Level
              .calculate(newInstance.__data.data.experience)
              .then(function (levelData) {
                newInstance.__data.levelData = levelData;
                callback(null, newInstance);
              });
          })
          .catch(callback);

        return callback.promise;
      };

      let oldUpdateAttributes = _AppUserAccount.prototype.updateAttributes;
      _AppUserAccount.prototype.updateAttributes = _AppUserAccount.prototype.patchAttributes = function (data, callback) {
        callback = callback || utils.createPromiseCallback();

        let modifiableData = AppUserData.getModifiableFiels();
        data.data = data.data || {};

        ValidationHelper
          .validatesDifference('municipalityId', null, data.data, _AppUserAccount)
          .then(() => {
            let userData = _.pick(data.data, modifiableData);
            delete data.data;
            delete data.levelData;

            oldUpdateAttributes.call(this, data, (err, newAttrib) => {
              if (err) return callback(err);
              if (_.isEmpty(userData)) {
                return callback(null, newAttrib);
              }
              this.data.update(userData, callback);
            });
          })
          .catch(function (err) {
            callback(err);
          });

        return callback.promise;
      };


      _AppUserAccount.observe('after save', async function (ctx, next) {
        try {
          let instance = ctx.instance || ctx.data;
          if (ctx.isNewInstance) {
            AppUserAccount.requestVerificationEmail(instance.email, instance);
          }
          next();
        } catch (err) {
          next(err);
        }
      });
    });


  async function generateVerificationToken() {
    let randomBytesFn = Promise.promisify(crypto.randomBytes, {context: crypto});
    let buff = await randomBytesFn(4);
    return buff.toString('hex');
  }

  /**
   *
   * @param email
   * @param [instance]
   * @param [cb]
   *
   * @return {Promise}
   */
  AppUserAccount.requestVerificationEmail = async function (email, instance, cb) {
    try {
      if (process.env.USE_ACCOUNT_VERIFICATION) {
        if (_.isFunction(instance)) {
          cb = instance;
          instance = null;
        }

        if (_.isNil(instance)) {
          instance = await _AppUserAccount.findOne({where: {email: email}});
          if (!instance) return ResponseHelper.errorHandler({
            status: 404,
            message: 'Email isn\'t registered for any user'
          }, cb);
        }

        let token = await generateVerificationToken();

        let fakeGenerateVerificationToken = function (user, cb) {
          cb(null, token);
        };

        let options = {
          type: 'email',
          to: instance.email,
          from: process.env.FROM_ACCOUNT_VERIFICATION_EMAIL,
          generateVerificationToken: fakeGenerateVerificationToken,
          subject: 'Bienvenido a Mutual.',
          token: token,
          uid: instance.id,
          template: path.resolve(__dirname, '../../server/views/verify.ejs'),
          user: instance,
          mailer: app.models.Mailer
        };
        await instance.verify(options);
      }
      return ResponseHelper.successHandler({}, cb);
    } catch (err) {
      ResponseHelper.errorHandler(err, cb);
    }
  };
  _AppUserAccount.remoteMethod('requestVerificationEmail', {
    http: {
      verb: 'get'
    },
    accepts: [
      {arg: 'email', type: 'string'}
    ]
  });


  /**
   *
   * @param {Number} challengeId
   * @param {Object} responses
   * @param [cb]
   *
   * @return {Promise}
   */
  AppUserAccount.prototype.completeChallenge = async function (challengeId, responses, cb) {
    try {

      /**
       *
       * @type {UserAppChallenge}
       */
      let userChallenge = await this.challenges.findById(challengeId, {
        include: [
          {
            relation: 'challenge',
            scope: {
              include: [
                'category',
                {
                  relation: 'reviewQuestions',
                  scope: {
                    include: [
                      'characteristic',
                      'answers'
                    ]
                  }
                }
              ]
            }
          },
          {
            relation: 'child',
            scope: {
              include: ['characteristics']
            }
          }
        ]
      });
      if (!userChallenge) {
        return ResponseHelper.errorHandler({
          status: 404,
          message: 'Challenge doesn\'t exists'
        }, cb);
      }

      await userChallenge.complete(responses);
      return ResponseHelper.successHandler({}, cb);
    } catch (err) {
      ResponseHelper.errorHandler(err, cb);
    }
  };
  _AppUserAccount.remoteMethod('completeChallenge', {
    isStatic: false,
    http: {
      verb: 'put',
      path: '/completeChallenge/:challengeId'
    },
    accepts: [
      {arg: 'challengeId', type: 'number', required: true},
      {
        arg: 'responses',
        type: 'object',
        description: [
          'An object in the form: ',
          '  { ',
          '      "idQ1": "idSelecAns1",',
          '      "idQ2": "idSelecAns2"',
          '  }'
        ],
        required: true
      }
    ]
  });

  function AppUserAccount() {
  }
};
