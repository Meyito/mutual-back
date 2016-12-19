/**
 * Created by garusis on 07/12/16.
 */
const fixtures = {
  appUser: require('./fixtures/app-user'),
  category: require('./fixtures/category'),
  challenge: require('./fixtures/challenge'),
  child: require('./fixtures/child'),
  characteristic: require('./fixtures/characteristic')
};

describe('AppUserAccount', function () {
  const AppUserAccount = app.models.AppUserAccount;
  const Category = app.models.Category;
  const Challenge = app.models.Challenge;
  const Characteristic = app.models.Characteristic;

  before(function () {
    return BPromise
      .all([
        Category.create(_.toArray(fixtures.category)),
        Characteristic.create(fixtures.characteristic)
      ])
      .spread(function (categories, characteristics) {
        let challenges = fixtures.challenge;
        categories = _.keyBy(categories, 'slug');
        characteristics = _.keyBy(characteristics, 'name');

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
        return [];
      });
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

  describe('#create', function () {
    it(`should create the user's children and relate them with the current characteristcs`, function () {
      return AppUserAccount.findById(fixtures.appUser.normalUser.id)
        .then(function (user) {
          return user.children.create(_.toArray(fixtures.child));
        })
        .then(function (user) {
        });
    });
  });

});
