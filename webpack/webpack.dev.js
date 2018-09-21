const merge = require("webpack-merge");

const packageInfo = require("../package");
const common = require("./webpack.config.js");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const dependencies = Object.assign({}, packageInfo.dependencies);
delete dependencies["canvas-ui"];
delete dependencies["cnvs"];

const maybeProfile = process.env.PROFILE_WEBPACK
  ? new SpeedMeasurePlugin().wrap
  : noop => noop;

module.exports = maybeProfile(
  merge(common, {
    mode: "development",
    entry: {
      index: "./src/js/index.js",
      vendor: Object.keys(dependencies)
    },
    devtool: "cheap-module-eval-source-map"
  })
);
