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
  let ValidationHelper;

  BuildHelper
    .build(Challenge, _Challenge)
    .then(function () {
      _Challenge.nestRemoting('reviewQuestions');
    });

  Challenge.assingOneTo = async function (child) {
    let count = await _Challenge.count();
    if (count === 0) return Promise.resolve();

    let indexTarget = Math.ceil(Math.random() * count);
    let challengeToAssing = await _Challenge.findById(indexTarget);

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
