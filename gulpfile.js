const gulp = require('gulp')
const sass = require('gulp-sass')
const del = require('del')
const rename = require('gulp-rename')
const thisss = require('./lib/thisss')

const config = {
  in: {
    root: './src',
    images: '!this[in.root]/images/[**.jpg,**.jpeg,**.png,**.gif]',
    index: '!this[in.root]/index.html',
    styles: '!this[in.root]/styles',
    sass: '!this[in.styles]/**.scss',
  },
  out: {
    root: './dist',
    assets: '!this[out.root]/assets',
    images: '!this[out.assets]/images',
    js: '!this[out.assets]/js',
    css: '!this[out.assets]/css'
  }
}


const paths = thisss(config)

gulp.task('showpaths',() => console.log(paths))

gulp.task('clean', (cb) => del(paths.out.root))

gulp.task('copy:index', () => gulp
  .src(paths.in.index)
    .pipe(gulp.dest(paths.out.root))
)

gulp.task('copy:images', () => gulp
  .src(paths.in.images)
    .pipe(gulp.dest(paths.out.images))
)

gulp.task('sass', () => gulp
  .src(paths.in.sass)
    .pipe(sourcemaps.init())
    .pipe(sass({indentedSyntax: true}))
    .on('error', $error_handler)
    .pipe(sourcemaps.write())
    .pipe(rename($config.output.compiled.sass))
    .pipe(paths.out.css)
)





