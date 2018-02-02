/**
 * Webpack Dev Server 2.X
extract-text-webpack-plugin 3.X <= new API surface
 */

const { DefinePlugin } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

function requireAll(array) {
  // https://stackoverflow.com/a/34574630/1559386
  return array.map(require.resolve);
}

module.exports = {
  entry: "./src/js/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  resolve: {
    alias: {
      PluginSDK: path.resolve(__dirname, "src/js/plugin-bridge/PluginSDK"),
      PluginTestUtils: path.resolve(
        __dirname,
        "src/js/plugin-bridge/PluginTestUtils"
      ),
      "#EXTERNAL_PLUGINS": path.resolve(
        __dirname,
        `${process.env.npm_config_externalplugins || "plugins"}`
      ),
      "#PLUGINS": path.resolve(__dirname, "plugins"),
      "#SRC": path.resolve(__dirname, "src")
    },
    modules: [
      // include packages
      path.resolve(__dirname, "packages"),
      // load dependencies of main project from within packages
      path.resolve(__dirname, "node_modules"),
      // load dependencies of packages themselves
      "node_modules"
    ]
  },
  node: {
    // Jison loader fails otherwise
    fs: "empty"
  },
  devtool: "cheap-module-eval-source-map",
  devServer: {
    // TODO: https://webpack.js.org/configuration/dev-server/#devserver-hot
    contentBase: path.join(__dirname, "dist"),
    open: true,
    overlay: true,
    port: 4200,
    proxy: require("./webpack.proxy.dev.js")
  },
  plugins: [
    new DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production"),
        LATER_COV: false
      }
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html"
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: requireAll([
              "babel-preset-es2015",
              "babel-preset-stage-3",
              "babel-preset-react"
            ])
          }
        }
      },
      // TODO: resource folders
      // TODO: add image optimizaiton
      // TODO: url loader?
      {
        test: /\.(svg|png|jpg|gif|ico|icns)$/,
        loader: "file-loader",
        options: {
          name: "./[hash]-[name].[ext]"
        }
      },
      // TODO: hash in filename?
      {
        test: /\.(ttf|woff)$/,
        loader: "file-loader",
        options: {
          name: "./fonts/source-sans-pro/[name].[ext]"
        }
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          },
          {
            loader: "less-loader"
          }
        ]
      },
      {
        test: /\.jison$/,
        loader: "jison-loader"
      },
      {
        test: /\.raml$/,
        loader: "raml-validator-loader"
      }
    ]
  }
};
