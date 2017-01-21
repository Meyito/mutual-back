/**
 * Created by garusis on 07/12/16.
 */
const fixtures = {
  appUser: require('./fixtures/app-user')
};

describe('Stats', function () {
  const AppUserAccount = app.models.AppUserAccount;
  const Stat = app.models.Stat;
  const DH = app.models.DebugHelper;
  const Category = app.models.Category;
  const Challenge = app.models.Challenge;
  const ReviewQuestion = app.models.ReviewQuestion;
  const ReviewAnswer = app.models.ReviewAnswer;
  const Characteristic = app.models.Characteristic;
  const ChildCharacteristic = app.models.ChildCharacteristic;
  const Goal = app.models.Goal;

  let startMigrationTime;
  let endMigrationTime;
  let midTime;

  before(function () {
    this.timeout(15000);
    startMigrationTime = Date.now();
    return BPromise
      .all([])
      .then(function () {
        let delay = 0;
        return BPromise
          .all(_.map(fixtures.appUser.statsUsers, function (user) {
            delay += 1000;
            return BPromise
              .delay(delay)
              .then(() => AppUserAccount.create(user))
          }));
      });
  });

  after(function () {
    return BPromise
      .all([
        AppUserAccount.destroyAll({})
      ]);
  });

  describe('#execQuery', function () {
    before(function () {
      endMigrationTime = startMigrationTime + (fixtures.appUser.statsUsers.length * 1000);
      midTime = startMigrationTime + ((endMigrationTime - startMigrationTime) / 2);
    })

    it(`should count all registered user from start migration until end migration`, function () {
      return Stat.execQuery('signup', [
        {field: 'created', operator: 'gte', value: startMigrationTime},
        {field: 'created', operator: 'lte', value: endMigrationTime}
      ])
        .then(function (count) {
        });
    });


    it(`should count all registered user from start migration until middle migration`, function () {
      return Stat.execQuery('signup', [
        {field: 'created', operator: 'gte', value: startMigrationTime},
        {field: 'created', operator: 'lte', value: midTime}
      ])
        .then(function (count) {
        });
    });

    it(`should count all registered user before start migration`, function () {
      return Stat.execQuery('signup', [
        {field: 'created', operator: 'lte', value: startMigrationTime}
      ])
        .then(function (count) {
        });
    });

    it(`should count all registered user before middle migration`, function () {
      return Stat.execQuery('signup', [
        {field: 'created', operator: 'lte', value: midTime}
      ])
        .then(function (count) {
        });
    });

    it(`should count all registered user before end migration from municipalityId 5`, function () {
      return Stat.execQuery('signup', [
        {field: 'created', operator: 'lte', value: endMigrationTime},
        {field: 'municipalityId', operator: 'eq', value: 5}
      ])
        .then(function (count) {
        });
    });

    it(`should count all registered user before end migration from municipalityId neq 5`, function () {
      return Stat.execQuery('signup', [
        {field: 'created', operator: 'lte', value: endMigrationTime},
        {field: 'municipalityId', operator: 'neq', value: 5}
      ])
        .then(function (count) {
        });
    });


  });
});
