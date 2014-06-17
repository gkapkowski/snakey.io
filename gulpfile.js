/* global require */
'use strict';
var gulp = require('gulp'),
    browserify = require('browserify'),
    watch = require('gulp-watch'),
    jshint = require('gulp-jshint'),
    clean = require('gulp-clean'),
    run = require('run-sequence'),
    stylish = require('jshint-stylish'),
    source = require('vinyl-source-stream'),
    glob = require('glob'),
    hbsfy = require('hbsfy');
    //notify = require('gulp-notify');

var scripts = glob.sync('./src/client/app/*.js');
var templates = glob.sync('./src/client/app/templates/*.hbs');
var files = scripts.concat(templates);

gulp.task('jshint', function () {
    return gulp.src(scripts)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'));
});

gulp.task('clean', function () {
    return gulp.src('dist/**', {read: false})
        .pipe(clean());
});

gulp.task('copy-client', function () {
    return gulp.src('src/client/template/**')
        .pipe(gulp.dest('dist/client/'));
});

gulp.task('copy-server', function () {
    return gulp.src('src/server/**')
        .pipe(gulp.dest('dist/server/'));
});

gulp.task('copy-other', function () {
    return gulp.src([
        'README.md',
        'LICENSE',
        'package.json'
    ]).pipe(gulp.dest('dist/'));
});

gulp.task('build', function () {
    return browserify(files)
        .transform(hbsfy)
        .bundle()
        .pipe(source('client.js'))
        .pipe(gulp.dest('dist/client/js/'));
    //.pipe(notify('Snakey.io - build done.'));
});

gulp.task('default', function () {
    watch({glob: 'src/**'}, function () {
        run('jshint','clean', [
            'copy-client',
            'copy-server',
            'copy-other',
            'build'
        ]);
    });
});