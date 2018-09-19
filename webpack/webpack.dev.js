const merge = require("webpack-merge");

const common = require("./webpack.config.js");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const maybeProfile = process.env.PROFILE_WEBPACK
  ? new SpeedMeasurePlugin().wrap
  : noop => noop;

module.exports = maybeProfile(
  merge(common, {
    mode: "development",
    entry: {
      index: "./src/js/index.js"
    },
    devtool: "cheap-module-eval-source-map"
  })
);
