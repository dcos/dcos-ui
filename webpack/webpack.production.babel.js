import CompressionPlugin from "compression-webpack-plugin";
import ExtractTextPlugin from "extract-text-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import StringReplacePlugin from "string-replace-webpack-plugin";
import webpack from "webpack";
import SVGCompilerPlugin from "./plugins/svg-compiler-plugin";

import packageInfo from "../package";
import webpackConfig from "./webpack.config.babel";

function addImageOptimizer(loader) {
  return (
    loader +
    "!image-webpack?" +
    JSON.stringify({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }]
    })
  );
}

const REPLACEMENT_VARS = {
  VERSION: packageInfo.version,
  ENV: process.env.NODE_ENV
};

const dependencies = Object.assign({}, packageInfo.dependencies);
delete dependencies["canvas-ui"];
delete dependencies["cnvs"];

module.exports = Object.assign({}, webpackConfig, {
  entry: {
    index: "./src/js/index.js",
    vendor: Object.keys(dependencies)
  },
  devtool: "#source-map",
  production: true,
  output: {
    path: "./dist",
    filename: "./[name].[hash].js"
  },
  plugins: [
    // Important to keep React file size down
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),

    new webpack.optimize.DedupePlugin(),

    new StringReplacePlugin(),

    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),

    new ExtractTextPlugin("./[name].[hash].css"),

    new webpack.optimize.CommonsChunkPlugin(
      "vendor",
      "vendor.[hash].js",
      Infinity
    ),

    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./src/index.html",
      production: true
    }),

    // Don't include images in /icons/_exports
    new webpack.IgnorePlugin(/icons\/_exports\//),

    new webpack.IgnorePlugin(/tests\/_fixtures\//),

    new SVGCompilerPlugin({ baseDir: "src/img/components/icons" }),

    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css|\.html$/,
      minRatio: 0.9
    })
  ],
  module: {
    preLoaders: webpackConfig.module.preLoaders,
    loaders: webpackConfig.module.loaders.concat([
      {
        test: /\.js$/,
        // Exclude all node_modules except dcos-dygraphs
        exclude: /(?=\/node_modules\/)(?!\/node_modules\/dcos-dygraphs\/)/,
        loader: "babel?" +
          JSON.stringify({
            cacheDirectory: true,
            // Map through resolve to fix preset loading problem
            presets: ["babel-preset-es2015", "babel-preset-react"].map(
              require.resolve
            )
          })
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("style", "css?-mergeLonghand!postcss")
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract(
          "style",
          "css?-mergeLonghand!postcss!less"
        )
      },
      {
        test: /\.png$/,
        loader: addImageOptimizer(
          "file?name=./[hash]-[name].[ext]&limit=100000&mimetype=image/png"
        )
      },
      {
        test: /\.svg$/,
        loader: addImageOptimizer(
          "file?name=./[hash]-[name].[ext]&limit=100000&mimetype=image/svg+xml"
        )
      },
      {
        test: /\.gif$/,
        loader: addImageOptimizer(
          "file?name=./[hash]-[name].[ext]&limit=100000&mimetype=image/gif"
        )
      },
      {
        test: /\.jpg$/,
        loader: addImageOptimizer("file?name=./[hash]-[name].[ext]")
      },
      // Replace @@variables
      {
        test: /.js$/,
        exclude: /node_modules/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /@@(\w+)/gi,
              replacement(match, key) {
                return REPLACEMENT_VARS[key];
              }
            }
          ]
        })
      }
    ]),
    postLoaders: webpackConfig.module.postLoaders
  }
});
