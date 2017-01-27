'use strict';

module.exports = function (Event) {

  const commonOperators = {
    lt: '<',
    gt: '>',
    lte: '<=',
    gte: '>=',
    eq: '=',
    neq: '<>'
  }
  let co = commonOperators

  const dataType = {
    date: {name: 'date', operators: [co.eq, co.neq, co.gt, co.lt, co.gte, co.lte]},
    number: {name: 'number', operators: [co.eq, co.neq, co.gt, co.lt, co.gte, co.lte]},
    reference: {name: 'reference', operators: [co.eq, co.neq]},
    noop_reference: {name: 'reference', operators: []}
  };

  const commonFields = {
    created: {
      name: 'created',
      label: 'fecha',
      type: dataType.date,
      grupable: false
    },
    municipalityId: {
      name: 'municipalityid',
      label: 'municipio',
      type: dataType.reference,
      grupable: false,
      endpoint: '/municipalities',
      labelField: 'name'
    },
    genderId: {
      name: 'genderid',
      label: 'genero',
      type: dataType.reference,
      grupable: false,
      endpoint: '/genders',
      labelField: 'label'
    },
    genderChildId: {
      name: 'genderchildid',
      label: 'genero del niño',
      type: dataType.reference,
      grupable: false,
      endpoint: '/genders',
      labelField: 'label'
    },
    dateOfBirth: {
      name: 'dateofbird',
      label: 'fecha de nacimieto',
      type: dataType.date,
      grupable: false
    },
    userId: {
      name: 'userid',
      label: 'usuario',
      type: dataType.noop_reference,
      grupable: false
    }
  }
  let cf = commonFields

  Event.EVENT_TYPES = {
    signup: {
      name: 'signup',
      label: 'Usuarios Registrados',
      fields: [cf.created, cf.municipalityId, cf.genderId]
    },
    childRegistry: {
      name: 'childRegistry',
      label: 'Niños Registrados',
      fields: [cf.created, cf.municipalityId, cf.genderChildId, cf.userId, cf.dateOfBirth]
    }
  }
  const EVENT_TYPES = Event.EVENT_TYPES;

};
