/* eslint no-console: "off" */

const gulp = require('gulp');
const babelify = require('babelify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const gutil = require('gulp-util');
const notify = require('gulp-notify');

const reportError = function (error) {
  notify({
    title: 'Task Failed [browserify]',
    message: 'See console.',
    sound: 'Purr' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
  }).write(error);

  // Pretty error reporting
  let report = '';
  const chalk = gutil.colors.white.bgRed;

  let message = error.stack;
  if (error._babel && error instanceof SyntaxError) {
    // Remove the Babel stack at the bottom of the formatted code.
    message = error.stack.replace(/\n\s*at .*/g, '');
  }

  report += chalk('TASK:') + ' browserify\n';
  report += chalk('PROB:') + ` ${message}\n`;
  console.error(report);

  // Prevent the 'watch' task from stopping
  this.emit('end');
};

gulp.task('default', ['css', 'img', 'browserify']);

gulp.task('css', function () {
  return gulp.src('src/css/*').pipe(gulp.dest('dist/css'));
});

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
    .on('error', reportError)
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.{js,jsx}', ['browserify']);
  gulp.watch('src/**/*.css', ['css']);
  gulp.watch('src/img/*', ['img']);
});

