const merge = require("webpack-merge");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
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
    output: {
      path: path.resolve(__dirname, "../dist/assets")
    },
    devtool: "cheap-module-eval-source-map",
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html"
      })
    ]
  })
);
