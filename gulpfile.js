var connect = require('gulp-connect');
var fs = require('fs');
var gulp = require('gulp');

gulp.task('ensureConfig', function () {
  // Make sure we have a Config.dev so we don't error on Config loading
  var configFilePath = './src/js/config/Config.dev.js';
  if (!fs.existsSync(configFilePath)) {
    var template = fs.readFileSync('./src/js/config/Config.template.js', 'utf8');
    fs.writeFileSync(configFilePath, template, 'utf8');
  }
});

gulp.task('ensureDevProxy', function () {
  // Create a proxy.dev to make getting started easier
  var proxyFilePath = './webpack/proxy.dev.js';
  if (!fs.existsSync(proxyFilePath)) {
    var template = fs.readFileSync('./webpack/proxy.template.js', 'utf8');
    fs.writeFileSync(proxyFilePath, template, 'utf8');
  }
});

gulp.task('serve', function () {
  connect.server({
    port: 4200,
    root: './dist'
  });
});
