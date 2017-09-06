const gulp = require('gulp');
const babelify = require('babelify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');

gulp.task('default', ['css', 'browserify']);

gulp.task('css', function () {
  return gulp.src('src/css/*').pipe(gulp.dest('dist/css'));
});

gulp.task('default', ['css', 'img', 'browserify']);

gulp.task('img', function () {
  return gulp.src('src/img/*').pipe(gulp.dest('dist/img'));
});

gulp.task('browserify', function () {
  return browserify({
    basedir: '.',
    debug: true,
    entries: ['src/scripts/main.jsx'],
    extensions: ['.jsx'],
    cache: {},
    packageCache: {}
  })
    .transform(babelify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.{js,jsx}', ['browserify']);
  gulp.watch('src/**/*.css', ['css']);
  gulp.watch('src/img/*', ['img']);
});
