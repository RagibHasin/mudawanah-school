const gulp = require('gulp')
const merge = require('merge-stream')
const ts = require('gulp-typescript')
const tslint = require('gulp-tslint')

const dest = './bin'

gulp.task('build', () => {
  const tsProj = ts.createProject('tsconfig.json')
  const tsc = tsProj()
  tsProj.src().pipe(tsc)

  return merge(
    tsc.js.pipe(gulp.dest(dest)),
    tsc.dts.pipe(gulp.dest(dest))
  )
})

gulp.task('default', ['build'])

gulp.task('watch', () => {
  gulp.watch('./src/**/*.ts', ['build', 'tslint'])
})

gulp.task('tslint', () => {
  const tsProj = ts.createProject('tsconfig.json')
  return tsProj.src()
    .pipe(tslint({
      formatter: 'prose'
    }))
    .pipe(tslint.report({
      emitError: false
    }))
})
