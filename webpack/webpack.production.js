const {
  optimize: { ModuleConcatenationPlugin, UglifyJsPlugin }
} = require("webpack");
const CompressionPlugin = require("compression-webpack-plugin");

const merge = require("webpack-merge");
const common = require("./webpack.config.js");

// TODO: add image optimizaiton
// TODO: url loader?
module.exports = merge(common, {
  plugins: [
    new ModuleConcatenationPlugin(),
    new UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
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
    }),
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ]
});
