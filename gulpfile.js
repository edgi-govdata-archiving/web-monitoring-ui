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
    sound: 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
  }).write(error);

  gutil.beep();

  // Pretty error reporting
  let report = '';
  const chalk = gutil.colors.white.bgRed;
  const lineNumber = error.loc.line;

  report += chalk('TASK:') + ' browserify\n';
  report += chalk('PROB:') + ` ${error.message}\n`;
  report += chalk('LINE:') + ` ${lineNumber}\n`;
  console.error(report); // eslint-disable-line

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

