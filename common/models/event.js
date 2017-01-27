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
    string: {name: 'number', operators: [co.eq, co.neq]},
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
    birthday: {
      name: 'birthday',
      label: 'fecha de nacimiento',
      type: dataType.date,
      grupable: false
    },
    userId: {
      name: 'userid',
      label: 'usuario',
      type: dataType.noop_reference,
      grupable: true
    },
    childId: {
      name: 'childid',
      label: 'niño',
      type: dataType.noop_reference,
      grupable: true
    },
    categoryId: {
      name: 'categoryid',
      label: 'categoria',
      type: dataType.reference,
      grupable: false,
      endpoint: '/categories',
      labelField: 'name'
    },
    characteristicId: {
      name: 'characteristicid',
      label: 'caracteristica',
      type: dataType.reference,
      grupable: false,
      endpoint: '/characteristics',
      labelField: 'label'
    },
    goalId: {
      name: 'goalid',
      label: 'logro',
      type: dataType.reference,
      grupable: false,
      endpoint: '/goals',
      labelField: 'name'
    },
    alermeterValue: {
      name: 'alermetervalue',
      label: 'nivel del alertometro',
      type: dataType.number,
      grupable: false
    },
    characteristicValue: {
      name: 'characteristicvalue',
      label: 'nivel de la caracteristica',
      type: dataType.number,
      grupable: false
    }
  }
  let cf = commonFields
  Event.COMMON_FIELDS = cf

  Event.EVENT_TYPES = {
    signup: {
      name: 'signup',
      label: 'Usuarios Registrados',
      fields: [cf.created, cf.municipalityId, cf.genderId]
    },
    childRegistry: {
      name: 'childRegistry',
      label: 'Niños Registrados',
      fields: [cf.created, cf.municipalityId, cf.genderChildId, cf.userId, cf.birthday]
    },
    assignmentOfChallenge: {
      name: 'assignmentOfChallenge',
      label: 'Retos Assignados',
      fields: [cf.created, cf.municipalityId, cf.genderChildId, cf.userId, cf.childId, cf.birthday, cf.categoryId]
    },
    characteristicValue: {
      name: 'characteristicValue',
      label: 'Valor de Caracteristica',
      fields: [cf.created, cf.municipalityId, cf.genderChildId, cf.childId, cf.birthday, cf.characteristicId, cf.characteristicValue]
    },
    lowCharacteristicValue: {
      name: 'lowCharacteristicValue',
      label: 'Caracteristicas en Riesgo',
      fields: [cf.created, cf.municipalityId, cf.genderChildId, cf.childId, cf.birthday, cf.characteristicId, cf.characteristicValue]
    },
    lowAlermeterValue: {
      name: 'lowAlermeterValue',
      label: 'Caracteristicas en Riesgo',
      fields: [cf.created, cf.municipalityId, cf.genderChildId, cf.childId, cf.birthday, cf.alermeterValue]
    },
    alermeterValue: {
      name: 'lowAlermeterValue',
      label: 'Caracteristicas en Riesgo',
      fields: [cf.created, cf.municipalityId, cf.genderChildId, cf.childId, cf.birthday, cf.alermeterValue]
    },
    gotGoals: {
      name: 'gotGoals',
      label: 'Logros Conseguidos',
      fields: [cf.created, cf.municipalityId, cf.userId, cf.categoryId]
    },
    finishedChallenge: {
      name: 'finishedChallenge',
      label: 'Retos Finalizados',
      fields: [cf.created, cf.municipalityId, cf.genderChildId, cf.userId, cf.childId, cf.birthday, cf.categoryId]
    }
  }
  const EVENT_TYPES = Event.EVENT_TYPES;

};
