'use strict';
/**
 *
 * @param {AppUserAccount} _AppUserAccount
 */
module.exports = function (_AppUserAccount) {
  const loopback = require('loopback')
  const Promise = require('bluebird');
  const path = require('path');
  const crypto = require('crypto');
  const _ = require('lodash');
  const g = require('strong-globalize')();

  const utils = require(`${process.cwd()}/node_modules/loopback/lib/utils`);

  const BuildHelper = require('../../server/build-helper');
  const app = require('../../server/server');

  const PASSWORD_RECOVERY_TEMPLATE = path.resolve(__dirname, '../../server/views/restore-password.ejs');


  let AppConstant;
  let AppUserData;
  let Level;
  let ResponseHelper;
  let ValidationHelper;
  let UserAppChallenge;
  let UserCategoryScore;
  let UserGoal;
  let Goal;
  let Event;
  let Mailer;
  let DH;

  BuildHelper
    .build(AppUserAccount, _AppUserAccount)
    .then(function () {
      AppConstant = app.models.AppConstant;
      AppUserData = app.models.AppUserData;
      ResponseHelper = app.models.ResponseHelper;
      ValidationHelper = app.models.ValidationHelper;
      UserAppChallenge = app.models.UserAppChallenge;
      UserCategoryScore = app.models.UserCategoryScore;
      UserGoal = app.models.AppUserGoal;
      Mailer = app.models.Mailer
      Goal = app.models.Goal;
      Level = app.models.Level;
      Event = app.models.Event;
      DH = app.models.DebugHelper;

      let oldCreate = _AppUserAccount.create;
      _AppUserAccount.create = function (data) {
        data = _.clone(data);
        if (data.fbId) {
          data.emailVerified = true;
          data.password = data.fbId;
          data.username = data.fbId;
        }

        let callback = arguments[arguments.length - 1];
        callback = _.isFunction(callback) ? callback : utils.createPromiseCallback();

        let modifiableData = AppUserData.getModifiableFiels();

        ValidationHelper.validatesPresenceOf('data', data, _AppUserAccount)
          .then(() => ValidationHelper.validatesPresenceOf('municipalityId', data.data, _AppUserAccount))
          .then(() => {
            let userData = _.pick(data.data, modifiableData);
            delete data.data;

            oldCreate.call(this, data, function (err, newInstance) {
              if (err) return callback(err);
              if (_.isArray(newInstance)) {
                return callback(null, newInstance);
              }
              newInstance.data.create(userData, function (err, data) {
                Event.create({
                  type: Event.EVENT_TYPES.signup.name,
                  userid: newInstance.id,
                  genderid: data.genderId,
                  municipalityid: data.municipalityId
                }).catch((err) => DH.debug.error(err));
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

      let oldLogin = _AppUserAccount.login;
      _AppUserAccount.login = function (credentials, include, cb) {
        if (!_.isFunction(cb)) {
          cb = include
          include = undefined
        }
        cb = cb || utils.createPromiseCallback()

        let registrationId = credentials.registrationId;

        let postCreateToken = function (err, token) {
          if (err) {
            return cb(err);
          }

          token.updateAttribute('registrationId', registrationId).catch((err) => DH.debug.error(err))
          cb(null, token)
        }

        if (credentials.fbId) {
          _AppUserAccount.findOne({where: {fbId: credentials.fbId}})
            .then(function (user) {
              if (!user) {
                let error = new Error(g.f('login failed'))
                error.statusCode = 401
                error.code = 'LOGIN_FAILED'
                return cb(error)
              }
              user.createAccessToken({}, postCreateToken)
            })
            .catch(cb);
        } else {
          oldLogin.call(this, credentials, include, postCreateToken);
        }

        return cb.promise;
      }


      _AppUserAccount.observe('after save', async function (ctx, next) {
        try {
          let instance = ctx.instance || ctx.data;
          if (ctx.isNewInstance && !instance.fbId) {
            AppUserAccount.requestVerificationEmail(instance.email, instance);
          }
          next();
        } catch (err) {
          next(err);
        }
      });

      _AppUserAccount.on('resetPasswordRequest', function (info) {
        let token = info.accessToken.id

        let template = loopback.template(PASSWORD_RECOVERY_TEMPLATE);
        template = template({token: token, uid: info.user.id})

        let options = {
          from: process.env.FROM_ACCOUNT_PASS_RECOVERY_EMAIL,
          to: info.email,
          subject: 'Recupera tu contraseña',
          html: template
        };

        Mailer.send(options, function (err) {
          if (err)
            DH.debug.error(err)
        })
      })

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
          mailer: Mailer
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

  AppUserAccount.prototype.checkGoals = async function (exp, categoryId, transaction) {

    let goals = await UserGoal.find({where: {userId: this.id}, fields: {goalId: true}});
    let goalsIds = _.map(goals, 'goalId');

    let medalsWon = await Goal.find({
      where: {
        minCategoryExp: {lte: exp}, id: {nin: goalsIds}, categoryId
      },
      fields: {id: true}
    });
    medalsWon = _.map(medalsWon, function (goal) {
      return {goalId: goal.id};
    });

    let newGoals = await this.goals.create(medalsWon, {transaction});

    _.forEach(newGoals, (goal) => {
      Event.create({
        type: Event.EVENT_TYPES.gotGoals.name,
        userid: this.id,
        municipalityid: this.data().municipalityId,
        categoryid: categoryId
      }).catch((err) => DH.debug.error(err));
    })

    return newGoals
  };

  AppUserAccount.prototype.updateExperience = async function (userChallenge, transaction) {
    let challenge = userChallenge.challenge();
    let userData = this.data();
    let categoryId = challenge.categoryId;

    let categoryScore = await UserCategoryScore.findOrCreate({where: {userId: this.id, categoryId: categoryId}},
      {userId: this.id, categoryId: categoryId, expInCategory: 0},
      {transaction});

    categoryScore.expInCategory += challenge.expPoints;
    await categoryScore.updateAttribute('expInCategory', categoryScore.expInCategory, {transaction});

    await this.checkGoals(categoryScore.expInCategory, categoryId, transaction);

    await userData.updateAttribute('experience', userData.experience + challenge.expPoints, {transaction});
  };


  /**
   *
   * @param {Number} challengeId
   * @param {Object} responses
   * @param [cb]
   *
   * @return {Promise}
   */
  AppUserAccount.prototype.completeChallenge = async function (challengeId, responses, cb) {
    let beginTransaction = Promise.promisify(_AppUserAccount.beginTransaction, {context: _AppUserAccount});
    let transaction;

    try {
      /**
       *
       * @type {UserAppChallenge}
       */
      let userChallenge = await UserAppChallenge.findById(challengeId, {
        include: [
          {
            relation: 'challenge',
            scope: {
              include: [
                'category',
                {
                  relation: 'reviewQuestions',
                  scope: {include: 'answers'}
                }
              ]
            }
          },
          {
            relation: 'child',
            scope: {
              include: {
                relation: 'characteristics',
                scope: {include: 'characteristic'}
              }
            }
          }
        ]
      });
      let child = userChallenge.child();

      if (!userChallenge) {
        return ResponseHelper.errorHandler({
          status: 404,
          message: 'Challenge doesn\'t exists'
        }, cb);
      }

      let requiredCharacteristics = _.chain(userChallenge.challenge().reviewQuestions())
        .map((reviewQuestion) => reviewQuestion.characteristicId)
        .uniq()
        .value();

      await userChallenge.child().addMissingCharacteristics(requiredCharacteristics);

      transaction = await beginTransaction({timeout: 120000});
      await userChallenge.complete(responses, transaction, this);
      await this.updateExperience(userChallenge, transaction);

      //ToDo: Update parent experience, category experience and goals
      await Promise.promisify(transaction.commit, {context: transaction})();

      child.checkLowCharacteristicLevel(this);

      Event.create({
        type: Event.EVENT_TYPES.finishedChallenge.name,
        userid: this.id,
        genderchildid: child.genderId,
        municipalityid: this.data().municipalityId,
        birthday: child.birthday,
        childid: child.id,
        categoryid: userChallenge.challenge().categoryId
      }).catch((err) => DH.debug.error(err));

      return ResponseHelper.successHandler({}, cb);
    } catch (err) {
      if (transaction) {
        transaction.rollback(function () {
        });
      }
      ResponseHelper.errorHandler(err, cb);
    }
  };
  _AppUserAccount.remoteMethod('completeChallenge', {
    isStatic: false,
    http: {
      verb: 'put',
      path: '/complete-challenge/:challengeId'
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
