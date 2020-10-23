const { optimize } = require("webpack");
const CompressionPlugin = require("compression-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const { merge } = require("webpack-merge");
const path = require("path");
const common = require("./webpack.config.js");

module.exports = merge(common, {
  mode: "production",
  entry: {
    index: "./src/js/index.tsx",
  },
  output: {
    path: path.resolve(__dirname, "../dist/assets"),
    publicPath: "/assets/",
  },
  devtool: "source-map",
  plugins: [
    new optimize.ModuleConcatenationPlugin(),
    new CompressionPlugin({ test: /\.js$|\.css$|\.html$/, threshold: 10240 }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "../index.html",
    }),
    // Chunks with 'chart' in the name are prefetched in anticipation of being loaded on the dashboard after login.
    // All other chunks that are not dynamically fetched are synchronous
    new ScriptExtHtmlWebpackPlugin({
      prefetch: {
        test: /chart/,
        chunks: "all",
      },
      defaultAttribute: "sync",
    }),
  ],
});
