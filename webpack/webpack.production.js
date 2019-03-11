const {
  DefinePlugin,
  optimize: { ModuleConcatenationPlugin }
} = require("webpack");

const CompressionPlugin = require("compression-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const merge = require("webpack-merge");
const path = require("path");

const packageInfo = require("../package");
const common = require("./webpack.config.js");

module.exports = merge(common, {
  mode: "production",
  entry: {
    index: "./src/js/index.js"
  },
  output: {
    path: path.resolve(__dirname, "../dist/assets"),
    publicPath: "/assets/"
  },
  devtool: "source-map",
  plugins: [
    new ModuleConcatenationPlugin(),
    new DefinePlugin({
      "process.env.version": JSON.stringify(packageInfo.version)
    }),
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "../index.html"
    })
  ]
});
