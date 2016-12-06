/**
 * Created by garusis on 04/12/16.
 */
const fixtures = require('./fixtures/level');

describe('Level', function () {
  const Level = app.models.Level;

  before(function () {
    let AppConstant = app.models.AppConstant;
    return Promise.all([
      AppConstant.updateAll({name: 'max_level_increment'}, {value: '10'}),
      AppConstant.updateAll({name: 'base_experience_by_lvl'}, {value: '1000'})
    ]);
  });
  describe('#calculate', function () {
    _.forEach(fixtures, function (testCase) {
      it(`should calculate the Level's related values for ${testCase.exp} experience points`, function () {
        return Level
          .calculate(testCase.exp)
          .then(function (result) {
            result.current.should.be.equal(testCase.current);
            result.currentExp.should.be.equal(testCase.currentExp);
            result.next.should.be.equal(testCase.next);
            result.requiredExp.should.be.equal(testCase.requiredExp);
          });
      });
    });
  });
});
