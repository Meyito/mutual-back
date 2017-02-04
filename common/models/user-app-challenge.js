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
  let Push
  let Event;
  let DH;

  BuildHelper
    .build(UserAppChallenge, _UserAppChallenge)
    .then(function () {
      ChildCharacteristic = app.models.ChildCharacteristic;
      Event = app.models.Event;
      Push = app.models.Push;
      DH = app.models.DebugHelper;

    });

  UserAppChallenge.prototype.complete = async function (response, transaction, user) {

    let questions = this.challenge().reviewQuestions();
    let child = this.child()
    let error;

    let childCharacteristics = child.characteristics();
    childCharacteristics = _.keyBy(childCharacteristics, 'characteristicId');

    _.every(questions, function (question) {
      let answer = _.find(question.answers(), {id: response[question.id]});
      if (!answer) {
        error = {
          status: 406,
          message: 'Selected Answer doesn\'t exists for this Question'
        };
        return false;
      }
      let characteristic = childCharacteristics[question.characteristicId];
      characteristic.statusValue += answer.characteristicValue;
      if (characteristic.statusValue > 50) {
        characteristic.statusValue = 50;
      }
      if (characteristic.statusValue < -50) {
        characteristic.statusValue = -50;
      }
      return true;
    });

    if (error) {
      throw error;
    }

    return this.updateAttribute('isFinished', true, {transaction})
      .then(function () {
        return Promise.all(_.map(childCharacteristics, function (childCharacteristic) {
          Event.create({
            type: Event.EVENT_TYPES.characteristicValue.name,
            userid: user.id,
            genderchildid: child.genderId,
            municipalityid: user.data().municipalityId,
            birthday: child.birthday,
            childid: child.id,
            characteristicid: childCharacteristic.characteristicId,
            characteristicvalue: childCharacteristic.statusValue
          }).catch((err) => DH.debug.error(err));
          return childCharacteristic.updateAttributes({statusValue: childCharacteristic.statusValue}, {transaction});
        }));
      });
  };

  function UserAppChallenge() {
  }

};
