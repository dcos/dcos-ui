const { DefinePlugin, NamedModulesPlugin } = require("webpack");
const merge = require("webpack-merge");
const DashboardPlugin = require("webpack-dashboard/plugin");

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
  devServer: {
    hot: true
  },
  devtool: "cheap-module-eval-source-map",
  plugins: [
    new DashboardPlugin(),
    new DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("development"),
        LATER_COV: false
      }
    }),
    new NamedModulesPlugin()
  ]
});
