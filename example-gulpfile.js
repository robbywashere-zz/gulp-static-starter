
(function() {
  var $bfy, $config, $css_compiled, $css_compiled_min, $css_dest, $error_handler, $js_compiled, $js_compiled_min, $js_dest, $print, $require, browser_sync, browserify, coffee, concat, css_min, del, gulp, gulpsync, gutil, inject, jade, ng_annotate, ng_template, path, rename, sass, sourcemaps, spawn, through, uglify;

  gulp = require('gulp');

  gulpsync = require('run-sequence');

  $require = require('rekuire');

  $config = $require('config/config');

  path = require('path');

  browserify = require('browserify');

  through = require('through2');

  gutil = require('gulp-util');

  coffee = require('gulp-coffee');

  rename = require('gulp-rename');

  sourcemaps = require('gulp-sourcemaps');

  ng_template = require('gulp-angular-templatecache');

  jade = require('gulp-jade');

  inject = require('gulp-inject');

  concat = require('gulp-concat');

  uglify = require('gulp-uglify');

  sass = require('gulp-sass');

  css_min = require('gulp-cssmin');

  browser_sync = require('browser-sync');

  ng_annotate = require('gulp-ng-annotate');

  spawn = require('child_process').spawn;

  del = require('del');

  $error_handler = function(err) {
    gutil.log(err);
    return this.emit('end');
  };

  $print = through.obj(function(file, enc, cb) {
    console.log(file.contents.toString());
    this.push(file);
    return cb();
  });

  $js_dest = function() {
    return gulp.dest(path.join($config.output.root, $config.output.assets.js));
  };

  $css_dest = function() {
    return gulp.dest(path.join($config.output.root, $config.output.assets.css));
  };

  $js_compiled = function(read) {
    if (read == null) {
      read = false;
    }
    return gulp.src(path.join($config.output.root, $config.output.assets.js, '*.js'), {
      read: read
    });
  };

  $css_compiled = function(read) {
    if (read == null) {
      read = false;
    }
    return gulp.src(path.join($config.output.root, $config.output.assets.css, '*.css'), {
      read: read
    });
  };

  $js_compiled_min = function() {
    var src;
    src = path.join($config.output.root, $config.output.assets.js, $config.output.build.js);
    return gulp.src(src, {
      read: false
    });
  };

  $css_compiled_min = function() {
    var src;
    src = path.join($config.output.root, $config.output.assets.css, $config.output.build.css);
    return gulp.src(src, {
      read: false
    });
  };

  $bfy = function() {
    return new through.obj(function(file, enc, cb) {
      return browserify(file).bundle((function(_this) {
        return function(err, src) {
          if (err) {
            _this.emit('error', err);
          } else {
            file.contents = new Buffer(src);
            _this.push(file);
          }
          return cb();
        };
      })(this));
    });
  };

  gulp.task('inject', function() {
    return gulp.src($config.input.index).pipe(inject($js_compiled(), {
      ignorePath: $config.output.root
    })).pipe(inject($css_compiled(), {
      ignorePath: $config.output.root
    })).pipe(gulp.dest($config.output.root));
  });

  gulp.task('inject.min', function() {
    return gulp.src($config.input.index).pipe(inject($js_compiled_min(), {
      ignorePath: $config.output.root
    })).pipe(inject($css_compiled_min(), {
      ignorePath: $config.output.root
    })).pipe(gulp.dest($config.output.root));
  });

  gulp.task('clean', function(cb) {
    return del($config.output.root, cb);
  });

  gulp.task('default', function(cb) {
    return gulpsync('clean', ['scripts', 'styles'], 'inject', 'serve', 'watch', cb);
  });

  gulp.task('prod', function(cb) {
    return gulpsync('clean', ['scripts', 'styles'], 'uglify', 'inject.min', cb);
  });

  gulp.task('scripts', ['scripts:coffee', 'scripts:ng-jade', 'scripts:vendor'], function() {});

  gulp.task('styles', ['styles:sass']);

  gulp.task('uglify', ['uglify:js', 'uglify:css'], function() {});

  gulp.task('uglify:js', function() {
    return $js_compiled(true).on('error', $error_handler).pipe(concat($config.output.build.js)).pipe(uglify()).pipe($js_dest());
  });

  gulp.task('uglify:css', function() {
    return $css_compiled(true).on('error', $error_handler).pipe(concat($config.output.build.css)).pipe(css_min()).pipe($css_dest());
  });

  gulp.task('scripts:ng-jade', function() {
    return gulp.src($config.input.templates).pipe(jade()).on('error', $error_handler).pipe(ng_template({
      standalone: true
    })).on('error', $error_handler).pipe(rename($config.output.compiled.templates)).pipe($js_dest());
  });

  gulp.task('config', function() {
    return gutil.log($config);
  });

  gulp.task('styles:sass', function() {
    return gulp.src($config.input.sass).pipe(sourcemaps.init()).pipe(sass({
      indentedSyntax: true
    })).on('error', $error_handler).pipe(sourcemaps.write()).pipe(rename($config.output.compiled.sass)).pipe($css_dest());
  });

  gulp.task('scripts:coffee', function() {
    return gulp.src($config.input.coffee).pipe(sourcemaps.init()).pipe(concat($config.output.compiled.coffee)).pipe(coffee({
      bare: true
    })).on('error', $error_handler).pipe(ng_annotate()).on('error', $error_handler).pipe($bfy()).on('error', $error_handler).pipe(sourcemaps.write()).pipe(gulp.dest(path.join($config.output.root, $config.output.assets.js)));
  });

  gulp.task('scripts:vendor', function() {
    return gulp.src($config.input.vendor_js).on('error', $error_handler).pipe(sourcemaps.init()).pipe(concat($config.output.compiled.vendor_js, {
      newLine: ';'
    })).pipe(sourcemaps.write()).pipe(gulp.dest(path.join($config.output.root, $config.output.assets.js)));
  });

  gulp.task("serve", function() {
    return browser_sync({
      server: {
        baseDir: $config.output.root
      },
      port: 8888
    });
  });

  gulp.task("watch", function() {
    gulp.watch($config.watch.sass, ['styles:sass', browser_sync.reload]);
    gulp.watch($config.watch.coffee, ['scripts:coffee', browser_sync.reload]);
    return gulp.watch($config.watch.templates, ['scripts:ng-jade', browser_sync.reload]);
  });

  gulp.task("auto", function() {
    var p, spawnChildren;
    spawnChildren = function(e) {
      var p;
      if (p) {
        p.kill();
      }
      p = spawn("gulp", {
        stdio: "inherit"
      });
    };
    p = void 0;
    gulp.watch("gulpfile.coffee", spawnChildren);
    spawnChildren();
  });

}).call(this);
