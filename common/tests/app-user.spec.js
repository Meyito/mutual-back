/**
 * Created by garusis on 07/12/16.
 */
const fixtures = {
  appUser: require('./fixtures/app-user'),
  category: require('./fixtures/category'),
  challenge: require('./fixtures/challenge'),
  child: require('./fixtures/child'),
  characteristic: require('./fixtures/characteristic'),
  questions: require('./fixtures/review-question'),
  challengesResponses: require('./fixtures/user-app-challenge')
};

describe('AppUserAccount', function () {
  const AppUserAccount = app.models.AppUserAccount;
  const Category = app.models.Category;
  const Challenge = app.models.Challenge;
  const ReviewQuestion = app.models.ReviewQuestion;
  const ReviewAnswer = app.models.ReviewAnswer;
  const Characteristic = app.models.Characteristic;
  const ChildCharacteristic = app.models.ChildCharacteristic;

  before(function () {

    return BPromise
      .all([
        Category.destroyAll({}),
        Characteristic.destroyAll({}),
        Challenge.destroyAll({}),
        ReviewQuestion.destroyAll({}),
        ReviewAnswer.destroyAll({})
      ])
      .then(function () {
        return BPromise
          .all([
            Category.create(_.toArray(fixtures.category)),
            Characteristic.create(fixtures.characteristic.slice(0, fixtures.characteristic.length - 1))
          ]);
      })
      .spread(function (categories, characteristics) {
        let challenges = fixtures.challenge;
        categories = _.keyBy(categories, 'slug');

        challenges.challenge1.categoryId = categories.confianza.id;
        challenges.challenge2.categoryId = categories.afecto.id;
        challenges.challenge3.categoryId = categories.entretenimiento.id;

        return BPromise
          .all([
            categories,
            characteristics,
            Challenge.create(_.toArray(challenges))
          ])
      })
      .spread(function (categories, characteristics, challenges) {
        challenges = _.keyBy(challenges, 'id');

        let promises = _.map(fixtures.questions, function (question) {
          let answers = question.answers;
          let challengeId = question.challengeId;

          delete question.answers;
          delete question.challengeId;

          return challenges[challengeId].reviewQuestions.create(question)
            .then(function (question) {
              return question.answers.create(answers);
            });
        });
        return BPromise.all(promises);
      });
  });

  after(function () {
    return BPromise
      .all([
        Category.destroyAll({}),
        Characteristic.destroyAll({}),
        Challenge.destroyAll({}),
        ReviewQuestion.destroyAll({}),
        ReviewAnswer.destroyAll({})
      ]);
  });

  describe('#create', function () {
    it(`should create an new user and its related userData`, function () {
      return AppUserAccount.create(fixtures.appUser.normalUser)
        .then(function (user) {
        });
    });
  });

  describe('#findById', function () {
    it(`should get an user, its relations and its level info by id`, function () {
      return AppUserAccount.findById(fixtures.appUser.normalUser.id)
        .then(function (user) {
        });
    });
  });

  describe('#prototype.updateAttributes', function () {
    it(`should get an user, and update its attributes`, function () {
      return AppUserAccount.findById(fixtures.appUser.normalUser.id)
        .then(function (user) {
          return user.updateAttributes({name: 'updatedName', data: {municipalityId: 11}});
        })
        .then(function (user) {
        });
    });
  });

  describe('#prototype.children.create', function () {
    it(`should create the user's children and relate them with the current characteristcs`, function () {
      return BPromise.resolve(AppUserAccount.findById(fixtures.appUser.normalUser.id))
        .then(function (user) {
          return BPromise.all([
            user,
            user.children.create(_.toArray(fixtures.child))
          ]);
        })
        .spread(function (user, children) {
          return BPromise.all(_.map(children, (child) => child.challenges()));
        })
        .then(function (challenges) {
        });
    });
  });

  describe('#prototype.children.findById', function () {
    it(`should get a user's children and its levelmeter number`, function () {
      return AppUserAccount.findById(fixtures.appUser.normalUser.id)
        .then(function (user) {
          return user.children.findById(fixtures.child.child1.id);
        })
        .then(function (children) {
          //console.log('alertmeterValue: ', children.toJSON().alertmeterValue);
        });
    });
  });

  describe('#Child.prototype.assignChallenge', function () {
    it(`should assignChallenges to each child`, function () {
      return AppUserAccount.findById(fixtures.appUser.normalUser.id)
        .then(function (user) {
          return BPromise.promisify(user.children)();
        })
        .then(function (children) {
          let promises = _.map(children, function (child) {
            return BPromise.promisify(child.challenges)()
              .then(function () {
                return BPromise.all([child.assignChallenge(), child.assignChallenge(), child.assignChallenge()])
                  .then(function () {
                    return BPromise.resolve(child);
                  });
              });
          });
          return BPromise.all(promises);
        });
    });
  });

  describe('#prototype.completeChallenge', function () {
    before(function () {
      let characteristcs = fixtures.characteristic;
      return Characteristic.create(characteristcs[characteristcs.length - 1]);
    });

    it('should mark a challenge as complete and modify the child-characteristic values', function () {
      this.timeout(50000);
      return AppUserAccount.findById(fixtures.appUser.normalUser.id, {include: 'challenges'})
        .then(function (user) {
          let promise = BPromise.resolve();
          _.forEach(user.challenges(), function (challenge) {
            promise = promise.then(() => user.completeChallenge(challenge.id, fixtures.challengesResponses[challenge.challengeId]));
          });
          return promise;
        })
        .then(function () {
          return ChildCharacteristic.find();
        })
        .then(function (characteristics) {
          console.log(_.groupBy(characteristics,'childId'));
        })
        .catch(function (err) {
          console.error(err.stack);
        });
    });
  });

});
