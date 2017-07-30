const gulp = require('gulp');
const babelify = require('babelify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const tsify = require('tsify');

gulp.task('default', ['css', 'browserify']);

gulp.task('css', function () {
    return gulp.src('src/css/*').pipe(gulp.dest('dist/css'));
})

gulp.task('browserify', function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/scripts/main.tsx'],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .transform(babelify)
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.{ts,tsx}', ['browserify']);
    gulp.watch('src/**/*.css', ['css']);
});
