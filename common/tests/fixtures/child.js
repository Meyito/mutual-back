/**
 * Created by garusis on 08/12/16.
 */
const moment = require('moment');

module.exports = {
  child1: {
    id: 1,
    name: 'Hijo 1',
    birthday: moment().subtract(3, 'years').toDate(),
    genderId: 1
  },
  child2: {
    id: 2,
    name: 'Hijo 2',
    birthday: moment().subtract(7, 'years').toDate(),
    genderId: 2
  }
};
