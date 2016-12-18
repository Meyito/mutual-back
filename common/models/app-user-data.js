'use strict';

module.exports = function(AppUserData) {


  AppUserData.getModifiableFiels = function () {
    return ['avatar','municipalityId','genderId'];
  };

};
