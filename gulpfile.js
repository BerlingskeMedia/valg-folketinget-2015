/*jslint indent:2, node:true, sloppy:true*/
var
  gulp = require('gulp'),
  coffee = require('gulp-coffee'),
  uglify = require('gulp-uglify'),
  ngmin = require('gulp-ngmin'),
  sass = require('gulp-sass'),
  styl = require('gulp-styl'),
  concat = require('gulp-concat'),
  csso = require('gulp-csso'),
  refresh = require('gulp-livereload'),
  imagemin = require('gulp-imagemin'),
  header = require('gulp-header'),
  cleanhtml = require('gulp-cleanhtml'),
  changed = require('gulp-changed'),
  googlecdn = require('gulp-google-cdn'),
  gulpif = require('gulp-if'),
  jade = require('gulp-jade'),
  lr = require('tiny-lr'),
  server = lr();

var banner = [
  '/**',
  ' ** Webtools',
  ' ** @author tcarlsen',
  ' **/',
  ''
].join('\n');

var build = false;
var dest = 'app';
/* Live reload server */
gulp.task('lr-server', function () {
  server.listen(35729, function (err) {
    if (err) {
      return console.log(err);
    }
  });
});
/* Scripts */
gulp.task('scripts', function () {
  gulp.src('src/**/*.coffee')
    .pipe(gulpif(!build, changed(dest)))
    .pipe(coffee())
    .pipe(ngmin())
    .pipe(gulpif(build, uglify()))
    .pipe(concat('scripts.min.js'))
    .pipe(header(banner))
    .pipe(gulp.dest(dest))
    .pipe(refresh(server));
});
/* Styles */
gulp.task('styles', function () {
  gulp.src('src/**/*.scss')
    .pipe(gulpif(!build, changed(dest)))
    .pipe(sass())
    .pipe(styl())
    .pipe(csso())
    .pipe(concat('styles.min.css'))
    .pipe(header(banner))
    .pipe(gulp.dest(dest))
    .pipe(refresh(server));
  gulp.src('src/styles/fonts/*')
    .pipe(gulp.dest(dest + '/fonts'));
});
/* Dom elements */
gulp.task('dom', function () {
  gulp.src('src/**/*.jade')
    .pipe(gulpif(!build, changed(dest)))
    .pipe(jade({pretty: true}))
    .pipe(gulpif(build, googlecdn(require('./bower.json'), {cdn: 'google'})))
    .pipe(gulpif(build, googlecdn(require('./bower.json'), {cdn: 'cdnjs'})))
    .pipe(gulpif(build, cleanhtml()))
    .pipe(gulp.dest(dest))
    .pipe(refresh(server));
});
/* Images */
gulp.task('images', function () {
  gulp.src('src/images/**')
    .pipe(gulpif(!build, changed('app/img')))
    .pipe(imagemin())
    .pipe(gulp.dest(dest + '/img'))
    .pipe(refresh(server));
});
/* Watch task */
gulp.task('watch', function () {
  gulp.watch('src/**/*.coffee', ['scripts']);
  gulp.watch('src/**/*.scss', ['styles']);
  gulp.watch('src/**/*.jade', ['dom']);
  gulp.watch('src/images/**', ['images']);
});
/* Build task */
gulp.task('build', function () {
  build = true;
  dest = 'build';

  gulp.start('scripts', 'styles', 'dom', 'images');
});
/* Default task */
gulp.task('default', ['lr-server', 'scripts', 'styles', 'dom', 'images', 'watch']);
