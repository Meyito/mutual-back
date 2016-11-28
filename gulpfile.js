"use strict";
/**
 * Created by garusis on 22/11/16.
 */
require('babel-core/register');
require('babel-polyfill');

const babel = require('gulp-babel');
const del = require('del');
const gulp = require('gulp');
const runSequence = require('run-sequence');
const sourcemaps = require('gulp-sourcemaps');
const config = require('config');
const merge = require('merge-stream');
const nodemon = require('gulp-nodemon');
const Promise = require('bluebird');

let app;

runSequence.use(gulp);

gulp.task('clean', (cb) => del(['./dist'], cb));

gulp.task('compile', function () {
  return gulp.src(['./**/*.js', '!./vendor/**/*', '!./node_modules/**/*', '!./dist/**/*', '!./*'])
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015', 'stage-0'],
      plugins: ['transform-runtime']
    }))
    .pipe(sourcemaps.write('.', {sourceRoot: './'}))
    .pipe(gulp.dest('dist/'));
});

gulp.task('copy', function () {
  return merge([
    gulp.src(['./**/*', '!./**/*.js', '!./vendor/**/*', '!./node_modules/**/*', '!./dist/**/*', '!./*']).pipe(gulp.dest('dist/'))]);
});

gulp.task('build', function (callback) {
  runSequence(
    'clean',
    ['compile', 'copy'],
    callback
  );
});

gulp.task('start-server', function () {
  nodemon({
    script: './dist/server/server',
    env: process.env
  });
});

gulp.task('run', function (callback) {
  runSequence(
    'build',
    'start-server',
    callback
  );
});

gulp.task('heroku:development', ['build']);

/**
 * Create all declared tables in DynamoDB.
 */
gulp.task('init', function (callback) {

});

/**
 * Delete all declared tables in DynamoDB.
 */
gulp.task('delete-tables', function (callback) {

});

gulp.task('insert-data', function (callback) {

});
