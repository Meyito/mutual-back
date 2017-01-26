'use strict';

module.exports = function (_Challenge) {

  const Promise = require('bluebird');
  const moment = require('moment');
  const _ = require('lodash');

  const BuildHelper = require('../../server/build-helper');
  const app = require('../../server/server');

  const utils = require(`${process.cwd()}/node_modules/loopback/lib/utils`);

  let AppConstant;
  let Characteristic;
  let ResponseHelper;
  let UserAppChallenge;
  let DH;

  let challengeCount = 0

  BuildHelper
    .build(Challenge, _Challenge)
    .then(function () {
      UserAppChallenge = app.models.UserAppChallenge
      DH = app.models.DebugHelper

      _Challenge.nestRemoting('reviewQuestions');

      _Challenge.count().then((count) => challengeCount = count);

      _Challenge.observe('after save', async function (ctx, next) {
        if (ctx.isNewInstance) {
          _Challenge.count().then((count) => challengeCount = count);
        }
        next();
      });
    });

  Challenge.getAssignableChallenge = async function (child) {
    let childAge = moment().diff(child.birthday, 'years')

    let activeChallenges = await UserAppChallenge.find({
      where: {
        childId: child.id,
        expirationDate: {
          gt: Date.now()
        },
        isFinished: {
          neq: true
        }
      },
      fields: {id: true}
    })
    activeChallenges = _.map(activeChallenges, 'id')

    let assignableChallenges = await _Challenge.find({
      where: {
        genderId: child.genderId,
        minAge: {lte: childAge},
        maxAge: {gte: childAge},
        id: {nin: activeChallenges}
      },
      fields: {id: true, expireAt: true}
    })

    DH.debug.info('There are %d assignableChallenges', assignableChallenges.length);
    if (assignableChallenges.length > 0) {
      let index = Math.floor(Math.random() * assignableChallenges.length);
      return assignableChallenges[index];
    }

    DH.debug.info('So we\'ll count all and there are %d challenges', challengeCount);
    if (challengeCount === 0) return;

    let indexTarget = Math.ceil(Math.random() * challengeCount);
    return await _Challenge.findById(indexTarget);
  }

  Challenge.assingOneTo = async function (child) {

    let challengeToAssing = await Challenge.getAssignableChallenge(child)


    let beginTransaction = Promise.promisify(_Challenge.beginTransaction, {context: _Challenge});
    let transaction = await beginTransaction({timeout: 60000});


    let challenge = await child.challenges.create({
      expirationDate: moment().add(challengeToAssing.expireAt, 'days').toDate(),
      challengeId: challengeToAssing.id,
      userId: child.userId
    }, {transaction});
    await child.updateAttribute('lastChallengeAssignment', Date.now(), {transaction})

    await Promise.promisify(transaction.commit, {context: transaction})();

    return challenge;
  };

  function Challenge() {
  }
};
