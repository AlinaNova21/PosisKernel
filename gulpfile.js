const path = require('path')
const fs = require('fs')
const gulp = require('gulp')
const gitrev = require('git-rev')
const screeps = require('gulp-screeps')
const auth = require('./auth.js')
const gutil = require('gulp-util')
const rm = require('rimraf')
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

gulp.task('default', ['screeps'])

gulp.task('clean', ()=>{
  return rm.sync('build') && rm.sync('dist')
})

gulp.task('dist', ['build','typings'], ()=>{
  return gulp.src(`build/*.js`)
    .pipe(gulp.dest(`dist`))
})

gulp.task('build',['copy','compile'])

gulp.task('copy', [], ()=>{
  return gulp.src(`src/*.js`)
    .pipe(gulp.dest(`build`))
})

gulp.task('compile', () => {
  return tsProject.src()
    .pipe(tsProject())
    .js.pipe(gulp.dest("build"))
})
gulp.task('typings', () => {
  return tsProject.src()
    .pipe(tsProject())
    .dts.pipe(gulp.dest("dist"))
})

gulp.task('screeps', ['clean','dist'], () => {
  gitrev.branch((branch) => {
    let ptr = false
    auth.branch = auth.branch || branch
    auth.ptr = ptr
    gutil.log('Branch:',auth.branch)
    gulp.src(`dist/*.js`)
      .pipe(screeps(auth))
  })
})
gulp.task('push', [], () => {
  gitrev.branch((branch) => {
    let ptr = false
    auth.branch = auth.branch || branch
    auth.ptr = ptr
    gutil.log('Branch:',auth.branch)
    gulp.src(`dist/*.js`)
      .pipe(screeps(auth))
  })
})