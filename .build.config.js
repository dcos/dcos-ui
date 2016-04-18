var srcFolder = "./src";
var distFolder = "./dist";
var pluginsFolder = "./plugins";
var externalPluginsTmpFolder = "./.external_plugins";

var dirs = {
  src: srcFolder,
  dist: distFolder,
  plugins: pluginsFolder,
  pluginsTmp: externalPluginsTmpFolder,
  srcJS: srcFolder + "/js",
  distJS: distFolder,
  srcCSS: srcFolder + "/styles",
  distCSS: distFolder,
  srcImg: srcFolder + "/img",
  distImg: distFolder + "/img"
};

var files = {
  srcJS: dirs.srcJS + "/index.js",
  distJS: dirs.distJS + "/index.js",
  srcCSS: dirs.srcCSS + "/index.less",
  distCSS: dirs.distCSS + "/index.css",
  srcHTML: dirs.src + "/index.html",
  distHTML: dirs.dist + "/index.html"
};

module.exports = {
  dirs: dirs,
  files: files
};
