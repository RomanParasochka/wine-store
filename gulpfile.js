const { src, dest, watch, parallel } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer'); // old browser
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default; // js
const imagemin = require('gulp-imagemin'); // images
const fileinclude = require('gulp-file-include');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');


function browsersync() {
    browserSync.init({
        server: {
            baseDir: "dist/"
        }
    });
}

function images() {
    return src('app/images/**/*')
        .pipe(imagemin(
            [
                imagemin.gifsicle({ interlaced: true }),
                imagemin.mozjpeg({ quality: 75, progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [
                        { removeViewBox: true },
                        { cleanupIDs: false }
                    ]
                })
            ]
        ))
        .pipe(dest('dist/images'))
}


function mainScripts() {
    return src([
            'app/js/main.js'
        ])
        .pipe(concat('main.min.js'))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write("./maps"))
        .pipe(dest('dist/js'))
        .pipe(browserSync.stream())
}

function allScripts() {
    return src([
            'app/js/**/*.js',
            '!app/js/main.js'
        ])
        .pipe(dest('dist/js'))
        .pipe(browserSync.stream())
}

function sassToCss() {
    return src('app/scss/*.scss')
        .pipe(scss({ outputStyle: 'compressed' }))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest('dist/css'))
        .pipe(browserSync.stream())
}

function cssStyles() {
    return src(['app/css/**/*.css'])
        .pipe(dest('dist/css'))
        .pipe(browserSync.stream())
}

function html() {
    return src(['app/*.html'])
        .pipe(fileinclude())
        .pipe(dest('dist/'))
        .pipe(browserSync.stream())
}

function fonts() {
    return src(['app/fonts/*'], { base: 'app' })
        .pipe(dest('dist/'))
}

function watching() {
    watch(['app/scss/**/*.scss'], sassToCss);
    watch(['app/css/**/*.css'], cssStyles);
    watch(['app/images/*'], images);
    watch(['app/fonts/*'], fonts);
    watch(['app/js/**/*.js', '!app/js/main.js'], allScripts);
    watch(['app/js/main.js'], mainScripts);
    watch(['app/**/*.html'], html).on('change', browserSync.reload);
}

exports.sassToCss = sassToCss;
exports.cssStyles = cssStyles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.mainScripts = mainScripts;
exports.allScripts = allScripts;
exports.images = images;
exports.html = html;
exports.fonts = fonts;

exports.default = parallel(
    images,
    fonts,
    html,
    cssStyles,
    sassToCss,
    mainScripts,
    allScripts,
    browsersync,
    watching);