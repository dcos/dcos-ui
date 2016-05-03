var connect = require('gulp-connect');
var fs = require('fs');
var gulp = require('gulp');

gulp.task('ensureConfig', function () {
  // Make sure we have a Config.dev so we don't error on Config loading
  var configFilePath = './src/js/config/Config.dev.js';
  if (!fs.existsSync(configFilePath)) {
    fs.writeFileSync(configFilePath, 'module.exports = {};', 'utf8');
  }
});

gulp.task('serve', function () {
  connect.server({
    port: 4200,
    root: './dist'
  });
});
