'use strict'

const app = require('../../server')

const _ = require('lodash')

let goals = [
  {
    name: '',
    slug: 'exploradores',
    image: '/files/goals/download/sin_t__tulo-1-01.png',
    inactiveImage: '/files/goals/download/sin_t__tulo-1-01_2.png',
    description: '',
    minCategoryExp: 0,
    categoryId: 'exploradores'
  },
  {
    name: 'Bronce',
    image: '/files/goals/download/sin_t__tulo-2-01.png',
    inactiveImage: '/files/goals/download/sin_t__tulo-2-01_2.png',
    description: '',
    minCategoryExp: 10,
    categoryId: 'atletas'
  },
  {
    name: 'Bronce',
    image: '/files/goals/download/sin_t__tulo-3-01.png',
    inactiveImage: '/files/goals/download/sin_t__tulo-3-01_2.png',
    description: '',
    minCategoryExp: 10,
    categoryId: 'humanitarios'
  },
  {
    name: 'Bronce',
    image: '/files/goals/download/sin_t__tulo-4-01.png',
    inactiveImage: '/files/goals/download/sin_t__tulo-4-01_2.png',
    description: '',
    minCategoryExp: 10,
    categoryId: 'espirituales'
  },
  {
    name: 'Bronce',
    image: '/files/goals/download/sin_t__tulo-5-01.png',
    inactiveImage: '/files/goals/download/sin_t__tulo-5-01_2.png',
    description: '',
    minCategoryExp: 10,
    categoryId: 'ecologicos'
  },
  {
    name: 'Bronce',
    image: '/files/goals/download/sin_t__tulo-6-01.png',
    inactiveImage: '/files/goals/download/sin_t__tulo-6-01_2.png',
    description: '',
    minCategoryExp: 10,
    categoryId: 'pilosos'
  },
  {
    name: 'Plata',
    image: '/files/goals/download/sin_t__tulo-7-01.png',
    inactiveImage: '/files/goals/download/sin_t__tulo-7-01_2.png',
    description: '',
    minCategoryExp: 100,
    categoryId: 'atletas'
  },
  {
    name: 'Plata',
    image: '/files/goals/download/sin_t__tulo-8-01.png',
    inactiveImage: '/files/goals/download/sin_t__tulo-8-01_2.png',
    description: '',
    minCategoryExp: 100,
    categoryId: 'humanitarios'
  },
  {
    name: 'Plata',
    image: '/files/goals/download/sin_t__tulo-9-01.png',
    inactiveImage: '/files/goals/download/sin_t__tulo-9-01_2.png',
    description: '',
    minCategoryExp: 100,
    categoryId: 'espirituales'
  },
  {
    name: 'Plata',
    image: '/files/goals/download/sin_t__tulo-10-01.png',
    inactiveImage: '/files/goals/download/sin_t__tulo-10-01_2.png',
    description: '',
    minCategoryExp: 100,
    categoryId: 'ecologicos'
  },
  {
    name: 'Plata',
    image: '/files/goals/download/sin_t__tulo-11-01.png',
    inactiveImage: '/files/goals/download/sin_t__tulo-11-01_2.png',
    description: '',
    minCategoryExp: 100,
    categoryId: 'pilosos'
  },
  {
    name: 'Oro',
    image: '/files/goals/download/sin_t__tulo-12-01.png',
    inactiveImage: '/files/goals/download/sin_t__tulo-12-01_2.png',
    description: '',
    minCategoryExp: 500,
    categoryId: 'atletas'
  },
  {
    name: 'Oro',
    image: '/files/goals/download/sin_t__tulo-13-01.png',
    inactiveImage: '/files/goals/download/sin_t__tulo-13-01_2.png',
    description: '',
    minCategoryExp: 500,
    categoryId: 'humanitarios'
  },
  {
    name: 'Oro',
    image: '/files/goals/download/sin_t__tulo-14-01.png',
    inactiveImage: '/files/goals/download/sin_t__tulo-14-01_2.png',
    description: '',
    minCategoryExp: 500,
    categoryId: 'espirituales'
  },
  {
    name: 'Oro',
    image: '/files/goals/download/sin_t__tulo-15-01.png',
    inactiveImage: '/files/goals/download/sin_t__tulo-15-01_2.png',
    description: '',
    minCategoryExp: 500,
    categoryId: 'ecologicos'
  },
  {
    name: 'Oro',
    image: '/files/goals/download/sin_t__tulo-16-01.png',
    inactiveImage: '/files/goals/download/sin_t__tulo-16-01_2.png',
    description: '',
    minCategoryExp: 500,
    categoryId: 'pilosos'
  }
];

async function fixGoals() {
  let Category = app.models.Category
  let categories = _.keyBy(await Category.find({}), 'slug')

  _.forEach(goals, (goal) => goal.categoryId = categories[goal.categoryId].id)
  return goals;
}

module.exports = fixGoals();
