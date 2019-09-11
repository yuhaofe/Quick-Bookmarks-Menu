// gulpfile runs on nodejs which not fully support es module yet.
const { src, dest, series } = require('gulp');
const del = require('del');
const zip = require('gulp-zip');
const terser = require('gulp-terser');
const clean = () => del('dist/**');

function copy() {
    return src(['_locales/**/*', 'icons/**/*', 'src/*.html' ,'manifest.json'], {base: '.', allowEmpty: true})
        .pipe(dest('dist/'));
}

function minify(){
    return src(['src/**/*.js', "web_modules/**/*.js"], {base: '.'})
        .pipe(terser())
        .pipe(dest('dist/'));
}

function pack() {
    return src('dist/**/*')
        .pipe(zip('archive.zip'))
        .pipe(dest('dist/'));
}

exports.build = series(clean, copy, minify);
exports.pack = pack;