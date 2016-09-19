const gulp = require('gulp')
const sass = require('gulp-sass')
const del = require('del')
const concat = require("gulp-concat");
const rename = require('gulp-rename')
const thisss = require('./lib/thisss')
const runsync = require('run-sequence')
const sourcemaps = require("gulp-sourcemaps")
const source  = require('vinyl-source-stream')
const print = require('gulp-print')
const browserify = require('browserify')
const babelify = require('babelify')
const buffer  = require('vinyl-buffer')
const uglify = require('gulp-uglify')
const browserSync = require('browser-sync')
const pug = require('gulp-pug')

const config = require('./config.js')

const paths = thisss(config)



gulp.task('pages', () => gulp
  .src(paths.in.pages.watch)
    .pipe(print())
    .pipe(pug())
    .pipe(gulp.dest(paths.out.root))
);

gulp.task('serve', ['build'], () => {

  browserSync.init({
    server: {
      baseDir: paths.out.root
    },
    logLevel: "debug"
  })

  gulp.watch(paths.in.styles.watch, ['styles'])
  gulp.watch(paths.in.js.watch, ['js'])
  gulp.watch(paths.in.index,['copy:index']).on('change', browserSync.reload);
})

gulp.task('styles', () => gulp
  .src(paths.in.styles.entry)
    .pipe(print())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(rename(paths.out.css.bundle))
    .pipe(gulp.dest(paths.out.css.root))
    .pipe(browserSync.stream())
)


gulp.task("js", () =>  browserify({ entries: paths.in.js.entry, debug:true })
  .transform(babelify, {presets: ["es2015"],sourceMaps:true})
    .bundle()
    .pipe(source(paths.in.js.entry))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(rename(paths.out.js.bundle))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.out.js.root))
    .pipe(browserSync.stream())
);

gulp.task('showpaths',() => console.log(paths))

gulp.task('clean', (cb) => del(paths.out.root))

gulp.task('copy',['copy:index','copy:images'])

gulp.task('build',(cb) => runsync('clean',['copy','styles','js'],cb))


gulp.task('copy:index', () => gulp
  .src(paths.in.index)
    .pipe(gulp.dest(paths.out.root))
)

gulp.task('copy:images', () => gulp
  .src(paths.in.images)
    .pipe(gulp.dest(paths.out.images))
)

