const {
  DefinePlugin,
  optimize: { ModuleConcatenationPlugin }
} = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

const merge = require("webpack-merge");
const common = require("./webpack.config.js");

// TODO: add image optimizaiton
// TODO: url loader?
module.exports = merge(common, {
  devtool: "source-map",
  plugins: [
    new ModuleConcatenationPlugin(),
    new UglifyJsPlugin({
      parallel: true,
      uglifyOptions: {
        compress: {
          warnings: false,
          ie8: false,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true
        },
        output: {
          comments: false
        }
      },
      sourceMap: true
    }),
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    }),
    new DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production"),
        LATER_COV: false
      }
    })
  ]
});
