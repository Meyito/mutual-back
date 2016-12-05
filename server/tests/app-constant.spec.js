/**
 * Created by garusis on 04/12/16.
 */
const fixtures = require('./fixtures/app-constant');

describe('AppConstant', function () {
  const AppConstant = app.models.AppConstant;

  describe('#create', function () {
    it('should create a explicit private AppConstant', function () {
      return AppConstant
        .create(fixtures.explicitPrivate)
        .then(function (newConstant) {
          newConstant.should.have.property('id').with.not.equal(null);
          newConstant.isPublic.should.equal(false);
        });
    });

    it('should create a implicit private AppConstant', function () {
      return AppConstant
        .create(fixtures.implicitPrivate)
        .then(function (newConstant) {
          newConstant.should.have.property('id').with.not.equal(null);
          newConstant.isPublic.should.equal(false);
        });
    });

    it('should create a public AppConstant', function () {
      return AppConstant
        .create(fixtures.public)
        .then(function (newConstant) {
          newConstant.should.have.property('id').with.not.equal(null);
          newConstant.isPublic.should.equal(true);
        });
    });
  });

  describe('#getPublic', function () {
    it('should get all public AppConstant', function () {
      return AppConstant
        .getPublic()
        .then(function (publicConstants) {
          publicConstants.should.be.instanceof(Array).with.length(1);
        });
    });
  });

});
