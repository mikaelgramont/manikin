var babel = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var fs = require('fs-extra');
var gulp = require('gulp-help')(require('gulp'));
var gulpWatch = require('gulp-watch');
var lazypipe = require('lazypipe');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var watchify = require('watchify');
var wrap = require('gulp-wrap');

gulp.task('default', 'Compile JS', function() {
	compileJs('./src/scripts/', 'app.js', './public/scripts/');	
});

// Used to e.g. references the ads binary from the runtime to get
// version lock.
var internalRuntimeVersion = new Date().getTime();

function compileJs(srcDir, srcFilename, destDir, options) {
  options = options || {};
  var bundler = browserify(srcDir + srcFilename, { debug: true })
      .transform(babel);
  if (options.watch) {
    bundler = watchify(bundler);
  }

  var wrapper = options.wrapper || '<%= contents %>';

  var lazybuild = lazypipe()
      .pipe(source, srcFilename)
      .pipe(buffer)
      .pipe(replace, /\$internalRuntimeVersion\$/g, internalRuntimeVersion)
      .pipe(wrap, wrapper)
      .pipe(sourcemaps.init.bind(sourcemaps), { loadMaps: true });

  var lazywrite = lazypipe()
      .pipe(sourcemaps.write.bind(sourcemaps), './')
      .pipe(gulp.dest.bind(gulp), destDir);

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(lazybuild())
      .pipe(lazywrite());
  }

  if (options.watch) {
    bundler.on('update', function() {
      console.log('-> bundling ' + srcDir + '...');
      rebundle();
    });
  }

  function minify() {
    console.log('Minifying ' + srcFilename);
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(lazybuild())
      .pipe(uglify({
        preserveComments: 'some'
      }))
      .pipe(rename(options.minifiedName))
      .pipe(lazywrite())
      .on('end', function() {
        fs.writeFileSync(destDir + '/version.txt', internalRuntimeVersion);
        if (options.latestName) {
          fs.copySync(
              destDir + '/' + options.minifiedName,
              destDir + '/' + options.latestName);
        }
      });
  }

  if (options.minify) {
    minify();
  } else {
    rebundle();
  }
}