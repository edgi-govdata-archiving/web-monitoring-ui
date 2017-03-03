var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");

gulp.task("default", ["browserify","watch"]);

gulp.task("browserify", function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/scripts/main.ts', 'src/scripts/Pagefreezer.ts'],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest("dist"));
});

gulp.task("watch", function() {
    gulp.watch('src/scripts/*.ts', ['browserify']);
});