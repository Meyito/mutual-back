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
        AppUserAccount.create(fixtures.appUser.normalUser),
        Category.create(_.toArray(fixtures.category)),
        Characteristic.create(fixtures.characteristic)
      ])
      .spread(function (normalUser, categories, characteristics) {
        let challenges = fixtures.challenge;
        categories = _.keyBy(categories, 'slug');
        characteristics = _.keyBy(characteristics, 'name');

        challenges.challenge1.categoryId = categories.confianza.id;
        challenges.challenge2.categoryId = categories.afecto.id;
        challenges.challenge3.categoryId = categories.entretenimiento.id;

        return BPromise
          .all([
            normalUser,
            categories,
            characteristics,
            Challenge.create(_.toArray(challenges)),
            normalUser.children.create(_.toArray(fixtures.child))
          ])
      })
      .spread(function (normalUser, categories, characteristics, challenges) {


        return [];
      });

  });
  describe('#calculate', function () {
    it(`should make something`, function () {

    });
  });
});
