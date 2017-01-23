'use strict'
const fs = require('fs')
const path = require('path')

let htmlPath = path.join(__dirname, 'html');

module.exports = [
  {
    question: "¿Cómo enseñarle a mi hijo a compartir?",
    content: fs.readFileSync(path.join(htmlPath, 'Pregunta1.html'), {encoding: 'utf8'})
  },
  {
    question: "¿Cómo actuar cuando mi hijo(a) tiene riñas con sus hermanos?",
    content: fs.readFileSync(path.join(htmlPath, 'Pregunta2.html'), {encoding: 'utf8'})
  },
  {
    question: "¿Qué debo hacer si mi hijo(a) adolescente no me cuenta sus sentimientos y problemas?",
    content: fs.readFileSync(path.join(htmlPath, 'Pregunta3.html'), {encoding: 'utf8'})
  },
  {
    question: "¿Cómo debo actuar o reaccionar cuando mi hijo me dice una mentira?",
    content: fs.readFileSync(path.join(htmlPath, 'Pregunta4.html'), {encoding: 'utf8'})
  },
  {
    question: "¿Qué debo hacer si sospecho que mi hijo(a) consume drogas?",
    content: fs.readFileSync(path.join(htmlPath, 'Pregunta5.html'), {encoding: 'utf8'})
  },
  {
    question: "¿Qué refuerzos positivos puedo emplear para mejorar la conducta desobediente de mi Hijo(a)?",
    content: fs.readFileSync(path.join(htmlPath, 'Pregunta6.html'), {encoding: 'utf8'})
  },
  {
    question: "¿Qué estrategias debo usar para enseñarle a mi hijo(a) a ser paciente",
    content: fs.readFileSync(path.join(htmlPath, 'Pregunta7.html'), {encoding: 'utf8'})
  },
  {
    question: "¿Qué castigo debo usar con mi hijo(a) cuando no se porta bien, sin que esto afecte su autoestima?",
    content: fs.readFileSync(path.join(htmlPath, 'Pregunta8.html'), {encoding: 'utf8'})
  },
  {
    question: "¿Cómo enseñarle a mi hijo(a) a ser ordenado sin tener que regañar o castigar?",
    content: fs.readFileSync(path.join(htmlPath, 'Pregunta9.html'), {encoding: 'utf8'})
  },
  {
    question: "¿Qué estrategias debo usar para que mi hijo(a) coma?",
    content: fs.readFileSync(path.join(htmlPath, 'Pregunta10.html'), {encoding: 'utf8'})
  }
]
