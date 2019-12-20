const merge = require("webpack-merge");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const common = require("./webpack.config.js");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");

const maybeProfile = process.env.PROFILE_WEBPACK
  ? new SpeedMeasurePlugin().wrap
  : noop => noop;

module.exports = maybeProfile(
  merge(common, {
    mode: "development",
    entry: {
      index: "./src/js/index.tsx"
    },
    output: {
      path: path.resolve(__dirname, "../dist/assets")
    },
    devtool: "cheap-module-eval-source-map",
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html"
      }),
      // Chunks with 'chart' in the name are prefetched in anticipation of being loaded on the dashboard after login.
      // All other chunks that are not dynamically fetched are synchronous
      new ScriptExtHtmlWebpackPlugin({
        prefetch: {
          test: /chart/,
          chunks: "all"
        },
        defaultAttribute: "sync"
      })
    ]
  })
);
