const { DefinePlugin } = require("webpack");
const merge = require("webpack-merge");

const packageInfo = require("../package");
const common = require("./webpack.config.js");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const dependencies = Object.assign({}, packageInfo.dependencies);
delete dependencies["canvas-ui"];
delete dependencies["cnvs"];

const profile_maybe = process.env.PROFILE_WEBPACK
  ? new SpeedMeasurePlugin().wrap
  : noop => noop;

module.exports = profile_maybe(
  merge(common, {
    entry: {
      index: "./src/js/index.js",
      vendor: Object.keys(dependencies)
    },
    devtool: "cheap-module-eval-source-map",
    plugins: [
      new DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("development"),
          LATER_COV: false
        }
      })
    ]
  })
);
