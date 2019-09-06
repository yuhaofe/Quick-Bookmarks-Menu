const { src, dest, series } = require('gulp');
const del = require('del');
const zip = require('gulp-zip');
const terser = require('gulp-terser');
const cleanCSS = require('gulp-clean-css');
const minifyInline = require('gulp-minify-inline');
const clean = () => del('dist/**');

function copy() {
    return src(['_locales/**/*', 'icons/**/*', 'src/*.html' ,'manifest.json'], {base: '.'})
        .pipe(dest('dist/'));
}

function minify_js(){
    return src('src/**/*.js')
        .pipe(terser())
        .pipe(dest('dist/src/'));
}

function minify_css() {
    return src('src/*.css')
        .pipe(cleanCSS())
        .pipe(dest('dist/src/'));
}

function minify_html() {
    return src('src/*.html')
        .pipe(minifyInline())
        .pipe(dest('dist/src/'));
}

function pack() {
    return src('dist/**/*')
        .pipe(zip('archive.zip'))
        .pipe(dest('dist/'));
}

exports.build = series(clean, copy, minify_js, minify_css, minify_html);
exports.pack = pack;