const {
  DefinePlugin,
  NamedModulesPlugin,
  HotModuleReplacementPlugin
} = require("webpack");
const merge = require("webpack-merge");

const packageInfo = require("../package");
const common = require("./webpack.config.js");

const dependencies = Object.assign({}, packageInfo.dependencies);
delete dependencies["canvas-ui"];
delete dependencies["cnvs"];

module.exports = merge(common, {
  entry: {
    index: ["react-hot-loader/patch", "./src/js/index.js"],
    vendor: Object.keys(dependencies)
  },
  devServer: {
    publicPath: "/",
    hot: true,
    inline: true
  },
  devtool: "cheap-module-eval-source-map",
  plugins: [
    new NamedModulesPlugin(),
    new HotModuleReplacementPlugin(),
    new DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("development"),
        LATER_COV: false
      }
    })
  ]
});
