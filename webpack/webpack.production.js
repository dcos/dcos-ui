const {
  DefinePlugin,
  optimize: { ModuleConcatenationPlugin }
} = require("webpack");

const CompressionPlugin = require("compression-webpack-plugin");
const merge = require("webpack-merge");
const SVGCompilerPlugin = require("./plugins/svg-compiler-plugin");

const packageInfo = require("../package");
const common = require("./webpack.config.js");

const dependencies = Object.assign({}, packageInfo.dependencies);
delete dependencies["canvas-ui"];
delete dependencies["cnvs"];

module.exports = merge(common, {
  mode: "production",
  entry: {
    index: "./src/js/index.js",
    vendor: Object.keys(dependencies)
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
