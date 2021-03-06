'use strict';

const gulp = require('gulp');
const gulplog = require('gulplog');
const webpack = require('webpack');
const notifier = require('node-notifier');
const path = require('path');
const fs = require('fs');
const buffer = require('vinyl-buffer');
const merge = require('merge-stream');

//
const modernizr = require('modernizr');
// модуль для создания растровых спрайтов
const spritesmith = require('gulp.spritesmith');
// модуль для форматирования
const prettier = require('@bdchauvette/gulp-prettier');
// модуль для создания svg-спрайтов
const svgSprite = require('gulp-svg-sprite');
// модуль для склеевания фалов
const concat = require('gulp-concat');
// модуль для переименования фалов
const replace = require('gulp-replace');
// модуль для переименования фалов
const rename = require('gulp-rename');
// Модуль для условного управления потоком
const gulpIf = require('gulp-if');
// плагин для удаления файлов и каталогов
const del = require('del');
// сервер для работы и автоматического обновления страниц
const browserSync = require('browser-sync').create();
// html препроцессор
const pug = require('gulp-pug');
// модуль для компиляции SASS (SCSS) в CSS
const sass = require('gulp-sass');
// модуль для автоматической установки автопрефиксов
const autoprefixer = require('gulp-autoprefixer');
// модуль для построения sourcemap
const sourcemaps = require('gulp-sourcemaps');
// модуль для минификации css
const cssmin = require('gulp-minify-css');
// модуль для сжатия PNG, JPEG, GIF и SVG изображений
const imagemin = require('gulp-imagemin');
// плагин для преобразования и изображений в webp
const webp = require('imagemin-webp');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

const paths = {
  pug: {
    src: "./src/pages/*.pug",
    dist: "./dist/",
    watch: ["./src/pages/*.pug", "./src/pageTemplates/*.pug"]
  },
  fonts: {
    src: "./src/fonts/**/*.{ttf,otf,woff,woff2}",
    dist: "./dist/fonts/",
    watch: "./src/fonts/**/*.{ttf,otf,woff,woff2}"
  },
  styles: {
    src: "./src/scss/*.scss",
    dist: "./dist//css/",
    watch: "./src/scss/*.scss"
  },
  images: {
    src: "./src/img/*.{jpg,jpeg,png,gif,svg,ico}",
    dist: "./dist//img/",
    watch: "./src/img/*.{jpg,jpeg,png,gif,svg,ico}"
  },
  imagesWebp: {
    src: "./src/img/*.{jpg,jpeg,png}",
    dist: "./dist//img/",
    watch: "./src/img/*.{jpg,jpeg,png}"
  },
  rastrSprite: {
    src: "./src/icons_r/*.{png,jpg,jpeg}",
    dist: "./dist/img/",
    watch: "./src/icons_r/*.{png,jpg,jpeg}"
  },
  svgSprite: {
    src: "./src/icons_v/*.svg",
    dist: "./dist/img/",
    watch: ["./src/icons_v/*.svg", "./src/icons_v/scssSpriteTemplate.mustache"]
  }
};

gulp.task('clean', (cb) => {
  del.sync([
    './dist/**/*',
    './tmp/**/*'
  ]);
  if (!fs.existsSync(path.resolve(__dirname, 'tmp'))) {
    fs.mkdirSync(path.resolve(__dirname, 'tmp'));
  }
  fs.closeSync(fs.openSync(path.resolve(__dirname, 'tmp/_icons.scss'), 'w'));
  fs.closeSync(fs.openSync(path.resolve(__dirname, 'tmp/_sprite.scss'), 'w'));
  cb();
});

gulp.task('pug', () => {
  return gulp.src(paths.pug.src)
    .pipe(pug())
    .pipe(prettier({
      htmlWhitespaceSensitivity: 'ignore'
    }))
    .pipe(rename({
      dirname: ''
    }))
    .pipe(gulp.dest(paths.pug.dist))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('styles', () => {
  return gulp.src(paths.styles.src)
    .pipe(sass({
      includePaths: [
        process.cwd()
      ]
    }))
    .pipe(autoprefixer())
    .pipe(gulpIf(!isDevelopment, cssmin()))
    .pipe(gulp.dest(paths.styles.dist))
    .pipe(browserSync.stream());
});

gulp.task('fonts', () => {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dist))
    .pipe(browserSync.stream());
});

gulp.task('images', () => {
  return gulp.src(paths.images.src)
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true,
        optimizationLevel: 3,
      }),
      imagemin.optipng({
        optimizationLevel: 7
      }),
      imagemin.svgo({
        plugins: [
          {removeViewBox: false},
          {cleanupIDs: false}
        ]
      }),
      imagemin.mozjpeg({
        quality: 75,
        progressive: true
      }),
    ]))
    .pipe(gulp.dest(paths.images.dist))
    .pipe(browserSync.stream());
});

gulp.task('imagesWebp', () => {
  return gulp.src(paths.imagesWebp.src)
    .pipe(imagemin([
      webp({
        quality: 75,
        method: 6
      }),
    ]))
    .pipe(rename({
      extname: '.webp'
    }))
    .pipe(gulp.dest(paths.imagesWebp.dist))
    .pipe(browserSync.stream());
});

gulp.task('rastrSprite', () => {
  let spriteData = gulp.src(paths.rastrSprite.src)
    .pipe(spritesmith({
      imgName: 'sprite.png',
      imgPath: paths.rastrSprite.dist + 'sprite.png',
      cssName: '_sprite.scss',
      padding: 5,
      cssVarMap: (sprite) => {
        sprite.name = 'icon-r-' + sprite.name;
      }
    }));

  let imgStream = spriteData.img
    .pipe(buffer())
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true,
        optimizationLevel: 3,
      }),
      imagemin.optipng({
        optimizationLevel: 7
      }),
      imagemin.svgo({
        plugins: [
          {removeViewBox: false},
          {cleanupIDs: false}
        ]
      }),
      imagemin.mozjpeg({
        quality: 75,
        progressive: true
      }),
    ]))
    .pipe(gulp.dest(paths.rastrSprite.dist));

  let cssStream = spriteData.css
    .pipe(gulp.dest('./tmp/'));

  return merge(imgStream, cssStream);
});

gulp.task('svgSprite', () => {
  return gulp.src(paths.svgSprite.src)
    .pipe(svgSprite({
      mode: {
        symbol: {
          dest: '.',
          sprite: 'icons.svg',
          render: {
            scss: {
              dest: '_icons.scss',
              template: 'src/icons_v/scssSpriteTemplate.mustache'
            }
          },
          example: true,
        }
      }
    }))
    .pipe(gulp.dest((file) => {
      return file.extname == '.svg' ?  paths.svgSprite.dist : './tmp/';
    }))
    .pipe(browserSync.stream());
});

gulp.task('modernizr', (cb) => {
  modernizr.build({
    "minify": true,
    "options": [
      "setClasses"
    ],
    "feature-detects": [
      "test/img/webp"
    ]
  }, (code) => {
    let folder = path.resolve(__dirname, 'dist/js');
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    let file = fs.openSync(folder + '/modernizr.js', 'w');
    fs.writeFileSync(file, code);
    fs.closeSync(file);
    cb();
  });
});

gulp.task('webpack', function(callback) {
  let options = {
    mode: isDevelopment ? 'development' : 'production',
    entry: {
      main: path.resolve(__dirname, 'src/js/main.js'),
    },
    output: {
      path: path.resolve(__dirname, 'dist/js'),
      publicPath: '/',
      /*library: 'ef',*/
    },
    watch: isDevelopment,
    watchOptions: {
      aggregateTimeout: 500,
      ignored: /node_modules/
    },
    devtool: isDevelopment ? 'cheap-module-inline-source-map' : false,
    resolve: {
      modules: [
        'node_modules',
        path.resolve(__dirname, 'src')
      ]
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: function(modulePath) {
            let includeModules = [
              'swiper',
              'dom7'
            ];
            return /node_modules/.test(modulePath) &&
              !includeModules.some((val) => {
                return new RegExp('node_modules\\\\' + val).test(modulePath);
              });
          },
          use: [/* {
            loader: 'echo-loader'
          },  */{
            loader: 'babel-loader'
          }]
        }
      ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        /*Popper: ['popper.js', 'default']*/
      })
    ]
  };

  webpack(options, function(err, stats) {
    if (!err) {
      err = stats.toJson().errors[0];
    }
    if (err) {
      notifier.notify({
        title: 'Webpack',
        message: err
      });
      gulplog.error(err);
    } else {
      gulplog.info(stats.toString({
        colors: true
      }));
    }
    if (!options.watch && err) {
      callback(err);
    } else {
      callback();
    }
  });
});

gulp.task('webserver', () => {
  browserSync.init({
    server: "./dist/",
    port: 4000,
    /*middleware: [
      function(req, res, next) {
        if (/(^\/local\/)/.test(req.url)) {
          req.url = '/www' + req.url;
        } else if (!/(^\/assets\/)|(^\/img\/)/.test(req.url)) {
          req.url = '/pages' + req.url;
        }
        next();
      }
    ]*/
  });

  gulp.watch(paths.pug.watch, gulp.series('pug'));
  gulp.watch(paths.styles.watch, gulp.series('styles'));
  gulp.watch(paths.images.watch, gulp.series('images'));
  gulp.watch(paths.imagesWebp.watch, gulp.series('imagesWebp'));
  gulp.watch(paths.rastrSprite.watch, gulp.series('rastrSprite', 'styles'));
  gulp.watch(paths.svgSprite.watch, gulp.series('svgSprite', 'styles'));
  gulp.watch(paths.fonts.watch, gulp.series('fonts'));
});

gulp.task('build',
  gulp.series('clean',
    gulp.parallel(
      'svgSprite',
      'rastrSprite',
    ),    
    gulp.parallel(
      'modernizr',
      'fonts',
      'images',
      'imagesWebp',
      'styles',
      'webpack',
      'pug'
    )
  )
);

gulp.task('default', gulp.series(
  'build',
  'webserver'
));
