'use strict';

module.exports = function (_UserAppChallenge) {

  const Promise = require('bluebird');
  const _ = require('lodash');

  const BuildHelper = require('../../server/build-helper');
  const app = require('../../server/server');

  const utils = require(`${process.cwd()}/node_modules/loopback/lib/utils`);

  let AppConstant;
  let Characteristic;
  let ResponseHelper;
  let ValidationHelper;
  let ChildCharacteristic;

  BuildHelper
    .build(UserAppChallenge, _UserAppChallenge)
    .then(function () {
      ChildCharacteristic = app.models.ChildCharacteristic;

    });

  UserAppChallenge.prototype.complete = async function (response) {

    let questions = this.challenge().reviewQuestions();
    let error;

    let characteristics = await ChildCharacteristic.find({where: {childId: this.childId}});
    characteristics = _.keyBy(characteristics, 'characteristicId');

    _.every(questions, function (question) {
      let answer = _.find(question.answers(), {id: response[question.id]});
      if (!answer) {
        error = {
          status: 406,
          message: 'Selected Answer doesn\'t exists for this Question'
        };
        return false;
      }
      characteristics[question.characteristicId].statusValue += answer.characteristicValue;
      return true;
    });

    if (error) {
      throw error;
    }

    return this.updateAttribute('isFinished', true)
      .then(function () {
        return Promise.all(_.map(characteristics, function (characteristic) {
          return characteristic.updateAttributes({statusValue: characteristic.statusValue});
        }));
      });
  };

  function UserAppChallenge() {
  }

};
