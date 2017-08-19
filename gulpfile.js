const gulp = require('gulp')
const merge = require('merge-stream')
const ts = require('gulp-typescript')
const html = require('gulp-htmlmin')
const tslint = require('gulp-tslint')

const dest = './bin'

function buildHeaders() {
  return gulp.src('src/*.html')
    .pipe(html({
      collapseWhitespace: true,
      minifyJS: true,
      minifyCSS: true
    }))
    .pipe(gulp.dest(dest))
}

gulp.task('build-headers', buildHeaders)

gulp.task('build', ['build-headers'], () => {
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
