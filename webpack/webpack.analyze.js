const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const merge = require("webpack-merge");
const production = require("./webpack.production.js");

module.exports = merge(production, {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      generateStatsFile: true,
    }),
  ],
});
