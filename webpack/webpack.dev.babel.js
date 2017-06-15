import ExtractTextPlugin from "extract-text-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import StringReplacePlugin from "string-replace-webpack-plugin";
import WebpackNotifierPlugin from "webpack-notifier";
import webpack from "webpack";
import SVGCompilerPlugin from "./plugins/svg-compiler-plugin";

import packageInfo from "../package";
import webpackConfig from "./webpack.config.babel";

// Defaults to value in package.json.
// Can override with npm config set port 80
const PORT = parseInt(process.env.npm_package_config_port, 10);
const environment = process.env.NODE_ENV;
let devtool = null;
const devServer = {
  proxy: require("./proxy.dev.js"),
  stats: {
    assets: false,
    colors: true,
    version: false,
    hash: false,
    timings: true,
    chunks: true,
    chunkModules: false
  }
};

const REPLACEMENT_VARS = {
  VERSION: packageInfo.version,
  ENV: environment
};

let dependencies = Object.assign({}, packageInfo.dependencies);
delete dependencies["canvas-ui"];
delete dependencies["cnvs"];
dependencies = Object.keys(dependencies).map(function(dependency) {
  return "node_modules/" + dependency;
});

const entry = {
  index: ["./src/js/index.js"],
  vendor: dependencies
};

if (environment === "development") {
  entry.index.unshift(
    `webpack-dev-server/client?http://localhost:${PORT}`,
    "webpack/hot/only-dev-server"
  );
  devtool = "#inline-eval-cheap-source-map";
} else if (environment === "testing") {
  // Cypress constantly saves fixture files, which causes webpack to detect
  // a filechange and rebuild the application. The problem with this is that
  // when Cypress goes to load the application again, it may not be ready to
  // be served, which causes the test to fail. This delays rebuilding the
  // application for a very long time when in a testing environment.
  const delayTime = 1000 * 60 * 60 * 5;
  devServer.watchOptions = {
    aggregateTimeout: delayTime,
    poll: delayTime
  };
}

let reactHotLoader = "react-hot!";

if (process.env.REACTJS_COMPONENTS_LOCAL) {
  reactHotLoader = "";
}

module.exports = Object.assign({}, webpackConfig, {
  entry,
  devtool,
  output: {
    path: "./build",
    filename: "[name].js"
  },
  devServer,
  plugins: [
    new StringReplacePlugin(),

    new HtmlWebpackPlugin({
      template: "./src/index.html"
    }),

    new ExtractTextPlugin("./[name].css"),

    new WebpackNotifierPlugin({ alwaysNotify: true }),

    new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.js", Infinity),

    new SVGCompilerPlugin({ baseDir: "src/img/components/icons" })
  ],
  module: {
    preLoaders: webpackConfig.module.preLoaders,
    loaders: webpackConfig.module.loaders.concat([
      {
        test: /\.js$/,
        // Exclude all node_modules except dcos-dygraphs
        exclude: /(?=\/node_modules\/)(?!\/node_modules\/dcos-dygraphs\/)/,
        loader: reactHotLoader +
          "babel?" +
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
        loader: "style!css!postcss"
      },
      {
        test: /\.less$/,
        loader: "style?sourceMap!css?sourceMap!postcss?sourceMap!less?sourceMap"
      },
      {
        test: /\.png$/,
        loader: "file?name=./[hash]-[name].[ext]&limit=100000&mimetype=image/png"
      },
      {
        test: /\.svg$/,
        loader: "file?name=./[hash]-[name].[ext]&limit=100000&mimetype=image/svg+xml"
      },
      {
        test: /\.gif$/,
        loader: "file?name=./[hash]-[name].[ext]&limit=100000&mimetype=image/gif"
      },
      {
        test: /\.jpg$/,
        loader: "file?name=./[hash]-[name].[ext]"
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
