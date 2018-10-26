const {
  DefinePlugin,
  optimize: { ModuleConcatenationPlugin }
} = require("webpack");

const CompressionPlugin = require("compression-webpack-plugin");
const merge = require("webpack-merge");
const SVGCompilerPlugin = require("./plugins/svg-compiler-plugin");

const packageInfo = require("../package");
const common = require("./webpack.config.js");

module.exports = merge(common, {
  mode: "production",
  entry: {
    index: "./src/js/index.js"
  },
  devtool: "source-map",
  plugins: [
    new ModuleConcatenationPlugin(),
    new DefinePlugin({
      "process.env.version": JSON.stringify(packageInfo.version)
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
