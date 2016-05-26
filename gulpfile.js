var gulp = require('gulp'),
    uglifyJs = require('gulp-uglify'),
    rename = require('gulp-rename'),
    ghPages = require('gulp-gh-pages'),
    inject = require('gulp-inject'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    mqpacker = require('css-mqpacker'),
    csswring = require('csswring'),
    concat = require('gulp-concat'),
    browserSync = require('browser-sync').create();

// GITHUB GH-PAGES DEPLOY
gulp.task('deploy', function() {
  return gulp.src('./build/**/*')
    .pipe(ghPages());
});

// INJECT STATIC FILE LINKS INTO HTML (DEV)
gulp.task('inject', function () {
  var target = gulp.src('./index.html');
  var sources = gulp.src(['js/*.js', '!js/*.min.js', 'css/**/*.css'], {read: false});
  return target.pipe(inject(sources))
    .pipe(gulp.dest('./'));
});

// JAVASCRIPT TASKS
// uglifies javascript
gulp.task('uglifyjs', function() {
  return gulp.src(['js/*.js', '!js/*.min.js'])
    .pipe(uglifyJs())
    .on('error', console.error.bind(console))
    .pipe(rename(function(path) {
      path.basename += '.min';
    }))
    .pipe(gulp.dest('./js/'));
});
// gulp.task('uglifyBigImg', function() {
//   return gulp.src('./js/bigimg.js')
//     .pipe(uglifyJs())
//     .on('error', console.error.bind(console))
//     .pipe(gulp.dest('./js/'));
// });

// STYLE TASKS
// converts / prefixes scss => css
gulp.task('css', function(){
  var processors = [
    autoprefixer({browsers: ['last 2 versions']}),
    mqpacker,
    // csswring
  ];
  gulp.src("./css/*.scss")
    // convert sass to css
    .pipe(sass().on('error', sass.logError))
    // minify / prefix
    .pipe(postcss(processors))
    // save
    .pipe(gulp.dest('css/'))
    .pipe(browserSync.stream());
});
// minifies css
gulp.task('minifycss', function(){
  var processors = [
    autoprefixer({browsers: ['last 2 versions']}),
    mqpacker,
    csswring
  ];
  gulp.src("./css/*.scss")
    // convert sass to css
    .pipe(sass().on('error', sass.logError))
    // minify / prefix
    .pipe(postcss(processors))
    // save
    .pipe(rename(function(path) {
      path.basename += '.min';
    }))
    .pipe(gulp.dest('css/'));
});


//////// BUILD PRODUCTION ////////
// COPY HTML
gulp.task('copy_html_to_production', function() {
  return gulp.src('./*.html')
    .pipe(gulp.dest('./build'));
});
// CONCAT / MINIFY / COPY CSS
gulp.task('copy_css_to_production', ['copy_html_to_production'], function() {
  var processors = [
    autoprefixer({browsers: ['last 2 versions']}),
    mqpacker,
    csswring
  ];
  return gulp.src(['css/**/*.css', '!css/**/*.min.css'])
    .pipe(concat('main.min.css'))
    // minify / prefix
    .pipe(postcss(processors))
    .pipe(gulp.dest('build/css/'));
});
// CONCAT / MINIFY / COPY JAVASCRIPT
gulp.task('copy_js_to_production', ['copy_css_to_production'], function() {
  // not needed for this project
  return;
  // return gulp.src(['js/**/*.js', '!js/**/*.min.js'])
  //   .pipe(concat('scripts.min.js'))
  //   .pipe(uglifyJs())
  //   .on('error', console.error.bind(console))
  //   .pipe(gulp.dest('build/js/'));
});
// INJECT SCRIPTS INTO HTML
gulp.task('inject_production', ['copy_js_to_production'], function() {
  return gulp.src('./build/*.html')
    .pipe(inject(gulp.src(['./build/js/*.js', './build/css/*.css'],{read: false}), {relative: true}))
    .pipe(gulp.dest('./build'));
});
// COPY IMAGES
gulp.task('copy_img_to_production', ['inject_production'], function() {
  gulp.src('img/*')
    .pipe(gulp.dest('build/img/'));
});

// SERVER / WATCH TASK
// starts server, watches javascript, css
gulp.task('serve', ['css'], function() {
  browserSync.init({
      server: "./"
  });
  gulp.watch('./css/*.scss', ['css']);
  gulp.watch(["./*.html", "./js/*.js"]).on('change', browserSync.reload);
});


// run production tasks and production server
gulp.task('serve_production', function(){
  browserSync.init({
      server: "./build"
  });
});

gulp.task('default', ['serve']);
gulp.task('build_production', 
  [
    'copy_html_to_production', 
    'copy_css_to_production', 
    'copy_js_to_production', 
    'inject_production',
    'copy_img_to_production'
  ]
);