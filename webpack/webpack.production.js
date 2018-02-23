const {
  DefinePlugin,
  optimize: { ModuleConcatenationPlugin }
} = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const merge = require("webpack-merge");
const SVGCompilerPlugin = require("./plugins/svg-compiler-plugin");

const packageInfo = require("../package");
const common = require("./webpack.config.js");

const dependencies = Object.assign({}, packageInfo.dependencies);
delete dependencies["canvas-ui"];
delete dependencies["cnvs"];

module.exports = merge(common, {
  entry: {
    index: "./src/js/index.js",
    vendor: Object.keys(dependencies)
  },
  devtool: "source-map",
  plugins: [
    new ModuleConcatenationPlugin(),
    new DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
      "process.env.version": packageInfo.version
    }),
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
    new SVGCompilerPlugin({ baseDir: "src/img/components/icons" }),
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ]
});
