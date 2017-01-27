/**
 * Created by garusis on 07/12/16.
 */
const fixtures = {
  appUser: require('./fixtures/app-user')
};

function buildChild() {
  return {
    "name": "asdasdasd",
    "birthday": moment().subtract(MathUtils.randomNumber(), 'years').toDate(),
    "genderId": MathUtils.randomNumber(2, 1)
  }
}

describe('Stats', function () {
  const AppUserAccount = app.models.AppUserAccount;
  const Stat = app.models.Stat;
  const Child = app.models.Child;
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
    this.timeout(30000);
    startMigrationTime = Date.now();
    return BPromise
      .all([
        Child.destroyAll({})
      ])
      .then(function () {
        let delay = 0;
        return BPromise
          .all(_.map(fixtures.appUser.statsUsers, function (user) {
            delay += 1000;
            return BPromise
              .delay(delay)
              .then(() => AppUserAccount.create(user))
              .then((user) => user.children.create(buildChild()))
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
        {field: 'created', operator: '>=', value: startMigrationTime},
        {field: 'created', operator: '<=', value: endMigrationTime}
      ])
        .then(function (count) {
          console.log(count)
        });
    });


    it(`should count all registered user from start migration until middle migration`, function () {
      return Stat.execQuery('signup', [
        {field: 'created', operator: '>=', value: startMigrationTime},
        {field: 'created', operator: '<=', value: midTime}
      ])
        .then(function (count) {
          console.log(count)
        });
    });

    it(`should count all registered user before start migration`, function () {
      return Stat.execQuery('signup', [
        {field: 'created', operator: '<=', value: startMigrationTime}
      ])
        .then(function (count) {
          console.log(count)
        });
    });

    it(`should count all registered user before middle migration`, function () {
      return Stat.execQuery('signup', [
        {field: 'created', operator: '<=', value: midTime}
      ])
        .then(function (count) {
          console.log(count)
        });
    });

    it(`should count all registered user before end migration from municipalityId 5`, function () {
      return Stat.execQuery('signup', [
        {field: 'created', operator: '<=', value: endMigrationTime},
        {field: 'municipalityid', operator: '=', value: 5}
      ])
        .then(function (count) {
          console.log(count)
        });
    });

    it(`should count all registered user before end migration from municipalityId neq 5`, function () {
      return Stat.execQuery('signup', [
        {field: 'created', operator: '<=', value: endMigrationTime},
        {field: 'municipalityid', operator: '<>', value: 5}
      ])
        .then(function (count) {
          console.log(count)
        });
    });

    it(`should count all registered user's children before end migration from municipalityId neq 5`, function () {
      return Stat.execQuery('childRegistry', [
        {field: 'created', operator: '<=', value: endMigrationTime},
        {field: 'municipalityid', operator: '<>', value: 5}
      ])
        .then(function (count) {
          console.log(count)
        });
    });

    it(`should count all less 5 years old registered user's children before end migration`, function () {
      return Stat.execQuery('childRegistry', [
        {field: 'created', operator: '<=', value: endMigrationTime},
        {field: 'birthday', operator: '>', value: moment().subtract(5, 'years').toDate()}
      ])
        .then(function (count) {
          console.log(count)
        });
    });

    it(`should count all less 5 years old registered user's female children before end migration`, function () {
      return Stat.execQuery('childRegistry', [
        {field: 'created', operator: '<=', value: endMigrationTime},
        {field: 'birthday', operator: '>', value: moment().subtract(5, 'years').toDate()},
        {field: 'genderchildid', operator: '=', value: 1}
      ])
        .then(function (count) {
          console.log(count)
        });
    });


    it(`should count all challenges assigned to children before end migration from municipalityId neq 5`, function () {
      return Stat.execQuery('assignmentOfChallenge', [
        {field: 'created', operator: '<=', value: endMigrationTime},
        {field: 'municipalityid', operator: '<>', value: 5}
      ])
        .then(function (count) {
          console.log(count)
        });
    });

    it(`should count all challenges assigned with different category to 2 before end migration`, function () {
      return Stat.execQuery('assignmentOfChallenge', [
        {field: 'created', operator: '<=', value: endMigrationTime},
        {field: 'categoryid', operator: '<>', value: 2}
      ])
        .then(function (count) {
          console.log(count)
        });
    });

    it(`should count all challenges assigned to less 5 years old children before end migration`, function () {
      return Stat.execQuery('assignmentOfChallenge', [
        {field: 'created', operator: '<=', value: endMigrationTime},
        {field: 'birthday', operator: '>', value: moment().subtract(5, 'years').toDate()}
      ])
        .then(function (count) {
          console.log(count)
        });
    });

    it(`should count all challenges assigned to less 5 years old female children but grouped before end migration`, function () {
      return Stat.execQuery('assignmentOfChallenge', [
        {field: 'created', operator: '<=', value: endMigrationTime},
        {field: 'birthday', operator: '>', value: moment().subtract(5, 'years').toDate()},
        {field: 'childid', group: true}
      ])
        .then(function (count) {
          console.log(count)
        });
    });

    it(`should count all children with someone characterist below 0 but grouped`, function () {
      return Stat.execQuery('characteristicValue', [
        {field: 'characteristicvalue', operator: '<', value: 0},
        {field: 'childid', group: true}
      ])
        .then(function (count) {
          console.log(count)
        });
    });

    it(`should count all children's characteristics below its allowed minValue`, function () {
      return Stat.execQuery('lowCharacteristicValue', [])
        .then(function (count) {
          console.log(count)
        });
    });

    it(`should count all Achievements fron category 2`, function () {
      return Stat.execQuery('gotGoals', [
        {field: 'categoryid', operator: '=', value: 2}
      ])
        .then(function (count) {
          console.log(count)
        });
    });

    it(`should count finished Challenges from category 2`, function () {
      return Stat.execQuery('finishedChallenge', [
        {field: 'categoryid', operator: '=', value: 2}
      ])
        .then(function (count) {
          console.log(count)
        });
    });

    it(`should count all childs with low alertmeter value`, function () {
      return Stat.execQuery('lowAlermeterValue', [
        {field: 'childid', group: true}
      ])
        .then(function (count) {
          console.log(count)
        });
    });

    it(`should count all childs with alertmeter value over 0`, function () {
      return Stat.execQuery('lowAlermeterValue', [
        {field: 'alermetervalue', operator: '>', value: 0},
        {field: 'childid', group: true}
      ])
        .then(function (count) {
          console.log(count)
        });
    });

  });
});
