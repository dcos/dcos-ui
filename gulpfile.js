var fs = require('fs');
// Make sure we have a Config.dev so we don't error on Config loading
var configFilePath = './src/js/config/Config.dev.js';
if (!fs.existsSync(configFilePath)) {
  fs.writeFileSync(configFilePath, 'module.exports = {};', 'utf8');
}
// dependencies
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var colorLighten = require('less-color-lighten');
var changed = require('gulp-changed');
var connect = require('gulp-connect');
var del = require('del');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var imagemin = require('gulp-imagemin');
var less = require('gulp-less');
var csso = require('gulp-csso');
var mkdirp = require('mkdirp');
var path = require('path');
var replace = require('gulp-replace');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var webpack = require('webpack');
var WebpackNotifierPlugin = require('webpack-notifier');

var config = require('./.build.config');
var packageInfo = require('./package');
var webpackConfig = require('./.webpack.config');

var development = process.env.NODE_ENV === 'development';
var devBuild = development || (process.env.NODE_ENV === 'testing');
var externalPluginsDirectory = '../dcos-ui-plugins-private';

var pluginsGlob = [
  externalPluginsDirectory + '/**/*.*'
];

function browserSyncReload() {
  if (development) {
    browserSync.reload();
  }
}
// Watches for delete in external plugins directory and deletes counterpart in
// DC/OS-UI directory
function deletePluginFile(event) {
  if (event.type === 'deleted') {
    var filePathFromPlugins = path.relative(
      path.resolve(externalPluginsDirectory), event.path);

    var destFilePath = path.resolve(
      config.dirs.pluginsTmp, filePathFromPlugins);

    del.sync(destFilePath);
    webpackFn(browserSyncReload);
  }
}

function ensurePluginDirectoryExists() {
  // Make temp plugins directory if doesn't exist
  if (!fs.existsSync(config.dirs.pluginsTmp)) {
    mkdirp(config.dirs.pluginsTmp, function () {
      console.log('Created ' + config.dirs.pluginsTmp);
    });
  }
}
ensurePluginDirectoryExists();

// Clean out plugins in destination folder
gulp.task('clean:external-plugins', function () {
  return del([config.dirs.pluginsTmp + '/**/*']);
});

// Copy over all
gulp.task('copy:external-plugins', ['clean:external-plugins'], function () {
  return gulp.src(pluginsGlob)
    .pipe(gulp.dest(config.dirs.pluginsTmp));
});

// Copy over changed files
gulp.task('copy:changed-external-plugins', function () {
  return gulp.src(pluginsGlob)
    .pipe(changed(config.dirs.pluginsTmp))
    .pipe(gulp.dest(config.dirs.pluginsTmp));
});

gulp.task('browsersync', function () {
  browserSync.init({
    online: true,
    open: false,
    port: 4200,
    server: {
      baseDir: config.dirs.dist
    },
    socket: {
      domain: 'localhost:4200'
    }
  });
});

gulp.task('connect:server', function () {
  connect.server({
    port: 4200,
    root: config.dirs.dist
  });
});

gulp.task('images', function () {
  return gulp.src([
      config.dirs.srcImg + '/**/*.*',
      '!' + config.dirs.srcImg + '/**/_exports/**/*.*'
    ])
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}]
    }))
    .pipe(gulp.dest(config.dirs.distImg));
});

gulp.task('html', function () {
  return gulp.src(config.files.srcHTML)
    .pipe(gulp.dest(config.dirs.dist))
    .on('end', browserSyncReload);
});

gulp.task('less', function () {
  return gulp.src(config.files.srcCSS)
    .pipe(gulpif(devBuild, sourcemaps.init()))
    .pipe(less({
      paths: [config.dirs.cssSrc], // @import paths
      plugins: [colorLighten]
    }))
    .on('error', function (err) {
      gutil.log(err);
      this.emit('end');
    })
    .pipe(autoprefixer())
    .pipe(gulpif(devBuild, sourcemaps.write()))
    .pipe(gulp.dest(config.dirs.distCSS))
    .pipe(gulpif(devBuild, browserSync.stream()));
});

gulp.task('minify-css', ['less'], function () {
  return gulp.src(config.files.distCSS)
    .pipe(csso())
    .pipe(gulp.dest(config.dirs.distCSS));
});

gulp.task('minify-js', ['replace-js-strings'], function () {
  return gulp.src(config.files.distJS)
    .pipe(uglify({
      mangle: true,
      compress: true
    }))
    .pipe(gulp.dest(config.dirs.distJS));
});

function replaceJsStringsFn() {
  return gulp.src(config.files.distJS)
    .pipe(replace('@@VERSION', packageInfo.version))
    .pipe(replace('@@ENV', process.env.NODE_ENV))
    .pipe(replace(
      '@@ANALYTICS_KEY',
      process.env.NODE_ENV === 'production' ?
        '51ybGTeFEFU1xo6u10XMDrr6kATFyRyh' :
        '39uhSEOoRHMw6cMR6st9tYXDbAL3JSaP'
    ))
    .pipe(gulp.dest(config.dirs.distJS))
    .on('end', browserSyncReload);
}
gulp.task('replace-js-strings', replaceJsStringsFn);

gulp.task('watch', function () {
  gulp.watch(config.files.srcHTML, ['html']);
  gulp.watch(config.dirs.srcCSS + '/**/*.less', ['less']);
  gulp.watch(config.dirs.srcImg + '/**/*.*', ['images']);
  var watcher = gulp.watch(pluginsGlob, ['copy:changed-external-plugins']);
  watcher.on('change', deletePluginFile);
  // Why aren't we watching any JS files? Because we use webpack's
  // internal watch, which is faster due to insane caching.
});

gulp.task('global-js', function () {
  return gulp.src([
    config.dirs.src + '/js/vendor/dygraph-combined.js'
  ])
  .pipe(gulp.dest(config.dirs.dist));
});

function webpackFn(callback) {
  var firstRun = true;

  if (process.env.NOTIFY === 'true') {
    webpackConfig.plugins.push(new WebpackNotifierPlugin({
      alwaysNotify: true,
      title: 'DC/OS UI - ' + packageInfo.version
    }));
  }

  webpack(webpackConfig, function (err, stats) {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }

    gutil.log('[webpack]', stats.toString({
      children: false,
      chunks: false,
      colors: true,
      modules: false,
      timing: true
    }));

    if (firstRun) {
      firstRun = false;
      if (callback) {
        callback();
      }
    } else {
      // This runs after webpack's internal watch rebuild.
      replaceJsStringsFn();
    }
  });
}
gulp.task('default', function (callback) {
  runSequence(
    'copy:external-plugins',
    ['global-js', 'less', 'images', 'html'],
    'webpack',
    'replace-js-strings',
    callback);
});

gulp.task('livereload', function (callback) {
  runSequence(
    'default',
    'browsersync',
    'watch',
    callback
  );
});

gulp.task('dist', function (callback) {
  runSequence(
    'default',
    'minify-css',
    'minify-js',
    callback
  );
});
// Use webpack to compile jsx into js.
gulp.task('webpack', webpackFn);

gulp.task('serve', ['default', 'connect:server', 'watch']);
