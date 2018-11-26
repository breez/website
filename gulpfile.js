var gulp = require('gulp');
var cache = require('gulp-cache');
var size = require('gulp-size');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var stream = require('event-stream');
var watch = require('gulp-watch');

var minifyCSS = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');

sass.compiler = require('node-sass');

function lintJs() {
  return gulp.src(['./assets/js/*.js', '!./assets/js/*.min.js', '!./assets/js/*jquery*', '!./assets/js/*bootstrap*'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
}

function concatJS() {
  var js = gulp.src(['./assets/js/*.js', '!./assets/js/*jquery*', '!./assets/js/*bootstrap*'])
    .pipe(concat('all.min.js'))
    .pipe(uglify())
    .pipe(size({
      title: 'size of custom js'
    }))
    .pipe(gulp.dest('./prod'));

  var jsDeps = gulp.src(['./assets/js/*jquery*', './assets/js/*bootstrap*'])
    .pipe(concat('libs.js'))
    .pipe(size({
      title: 'size of js dependencies'
    }))
    .pipe(gulp.dest('./prod'));
  stream.concat(js, jsDeps);
}

function compileSass() {
  return gulp.src('./assets/sass/**/*.scss')
    .pipe(sass().on("end",() => {
      concatCss();
      console.log('Concat Css: Ok');
    }))
    .pipe(gulp.dest('./assets/css'));
}

function concatCss() {
  return gulp.src([
      "./assets/css/font-awesome.min.css",
      "./assets/css/bootstrap.css",
      "./assets/css/animate.min.css",
      "./assets/css/owl.carousel.min.css",
      "./assets/css/owl.theme.default.min.css",
      "./assets/css/validation.css",
      "./assets/css/style.css",
      "./assets/css/responsive.css",
    ])
    .pipe(concat('styles.min.css'))
    .pipe(minifyCSS({
      keepBreaks: true
    }))
    .pipe(gulp.dest('./prod'));
}

function optimizationImg() {
  return gulp.src(['./assets/images/**/*'])
    .pipe(cache(imagemin({
      optimizationLevel: 5,
      progressive: true,
      interlaced: true
    })))
    .pipe(size({
      title: 'size of images'
    }))
    .pipe(gulp.dest('./prod/images'));
}


gulp.task('stream', function () {
  return watch('./assets/sass/**/*.scss', function () {
    compileSass();
    console.log('Compile Sass: Ok');
  });
});

function defaultTask(cb) {
  console.log('Hello =)');
  console.log('Let`s start');
  lintJs();
  console.log('Lint Js: Ok');
  concatJS();
  console.log('Concat Js: Ok');
  compileSass();
  console.log('Compile Sass: Ok');

  //optimizationImg();
  console.log('Optimization Img: Ok');
  cb();
}

exports.default = defaultTask