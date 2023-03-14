// common
import gulp from 'gulp';
import rename from 'gulp-rename';
import plumber from 'gulp-plumber';
import log from 'fancy-log';
import beeper from 'beeper';
// css
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import postcssNormalize from 'postcss-normalize';
import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';
import postcss100vhFix from 'postcss-100vh-fix';
import cleanCss from 'gulp-clean-css';
// images
import {deleteAsync, deleteSync} from 'del';
import path from 'path';
import cache from 'gulp-cache';
import imagemin from 'gulp-imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';
import imageminOptipng from 'imagemin-optipng';
import imageminSvgo from 'imagemin-svgo';


let paths = {
    src: {
        less: 'assets/less/*.less',
        img: ['assets/img/**/*.{png,jpg,gif,svg}'],
    },
    dest: {
        css: 'static/css/',
        img: 'static/img/',
    },
    watch: {
        less: 'assets/less/**/*.less',
    },
    cache: {
        tmpDir: 'tmp/',
        cacheDirName: 'gulp-cache',
    },
};


// LESS
gulp.task('less', function() {
    return gulp.src(paths.src.less)
        .pipe(plumber({errorHandler: onError}))
        .pipe(less())
        .pipe(postcss([
            postcss100vhFix(),
            autoprefixer({cascade: false}),
            postcssNormalize({forceImport: true}),
            postcssPresetEnv({
                stage: 2,
                features: {
                    // not performant
                    'all-property': false,
                    'case-insensitive-attributes': false,
                    // requires js polyfill
                    // 'blank-pseudo-class': false,
                    // 'focus-visible-pseudo-class': false,
                    // 'focus-within-pseudo-class': false,
                    // 'has-pseudo-class': false,
                    // 'prefers-color-scheme-query': false,
                },
                enableClientSidePolyfills: false,
            }),
        ]))
        .pipe(cleanCss({
            level: {
                1: {},
                2: {
                    removeUnusedAtRules: true,
                },
            },
        }))
        .pipe(rename({
            suffix: '.min',
        }))
        .pipe(gulp.dest(paths.dest.css));
});




// IMG
gulp.task('imagemin', function() {
    return gulp.src(paths.src.img)
        .pipe(plumber({errorHandler: onError}))
        .pipe(cache(
            imagemin([
                // imagemin.gifsicle({interlaced: true}),
                imageminMozjpeg({quality: 90}),
                imageminJpegtran({progressive: true}),
                imageminPngquant(),
                imageminOptipng({optimizationLevel: 5}),
                imageminSvgo({plugins: [{
                        name: 'removeViewBox',
                        active: false,
                    }]}),
            ], {
                verbose: true,
            }), {
                fileCache: new cache.Cache(paths.cache),
                name: 'default',
            }))
        .pipe(gulp.dest(paths.dest.img));
});
gulp.task('imagemin:clean-dest', function(cb) {
    deleteSync(paths.dest.img);
    cb();
});
gulp.task('imagemin:clean-cache', function(cb) {
    deleteSync([
        paths.cache.tmpDir + '/' + paths.cache.cacheDirName + '/default',
    ]);
    cb();
});
gulp.task('imagemin:clean', gulp.parallel('imagemin:clean-dest', 'imagemin:clean-cache'));



// Полная сборка без вотча
gulp.task('once', gulp.parallel('less', 'imagemin'));
// Полная сборка с вотчем
gulp.task('default', gulp.series(
    'once',
    function watch() {
        gulp.watch(paths.watch.less, gulp.task('less'));
        gulp.watch(paths.src.img, gulp.task('imagemin'))
            .on('unlink', function(filePath) {
                deleteAsync(paths.dest.img + path.basename(filePath));
            })
            .on('unlinkDir', function(dirPath) {
                deleteAsync(paths.dest.img + path.basename(dirPath));
            });
    },
));




// Ошибки
let onError = function(error) {
    log([
        (error.name + ' in ' + error.plugin).bold.red,
        '',
        error.message,
        '',
    ].join('\n'));
    beeper();
    this.emit('end');
};


