const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");
const terser = require("gulp-terser");

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(rename("styles.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("styles.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Images

const images = () => {
  return gulp.src("build/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({progressive: true}),
    ]))
    .pipe(gulp.dest("build/img"))
}

exports.images = images;

const webpImages = () => {
  return gulp.src("build/img/**/*.{png,jpg}")
    .pipe(webp({quality: 75}))
    .pipe(gulp.dest("build/img"))
}

exports.webpImages = webpImages;

const sprite = () => {
  return gulp.src("build/img/**/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
}

exports.sprite = sprite;


// Copy & clean

const copy = () => {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/*.ico",
    "source/*.html"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
}

exports.copy = copy;


const clean = () => {
  return del("build");
}

exports.clean = clean;

// HTML copy

const copyHTML = () => {
  return gulp.src([
    "source/*.html"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
}

exports.copyHTML = copyHTML;

// JS

const scripts = () => {
  return gulp.src("source/js/**/*.js")
    .pipe(terser())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest("build/js"))
    .pipe(sync.stream());
}

exports.scripts = scripts;

// Build

const build = gulp.series(
  clean,
  copy,
  styles,
  scripts,
  images,
  webpImages,
  sprite
)

exports.build = build;


// Start

const start = gulp.series (
  clean,
  copy,
  styles,
  scripts,
  images,
  webpImages,
  sprite
)

exports.start = start;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html", gulp.series("copyHTML")).on("change", sync.reload);
  gulp.watch("source/js/*.js", gulp.series("scripts")).on("change", sync.reload);
}

exports.default = gulp.series(
  start, server, watcher
);
