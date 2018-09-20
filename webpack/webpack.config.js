const { DefinePlugin } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const LessColorLighten = require("less-color-lighten");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

function requireAll(array) {
  // https://stackoverflow.com/a/34574630/1559386
  return array.map(require.resolve);
}

module.exports = {
  entry: "./src/js/index.js",
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "../dist")
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      PluginSDK: path.resolve(__dirname, "../src/js/plugin-bridge/PluginSDK"),
      PluginTestUtils: path.resolve(
        __dirname,
        "../src/js/plugin-bridge/PluginTestUtils"
      ),
      "#EXTERNAL_PLUGINS": path.resolve(
        __dirname,
        `../${process.env.npm_config_externalplugins || "../plugins"}`
      ),
      "#PLUGINS": path.resolve(__dirname, "../plugins"),
      "#SRC": path.resolve(__dirname, "../src"),
      "#TESTS": path.resolve(__dirname, "../tests")
    },
    modules: [
      // include packages
      path.resolve(__dirname, "../packages"),
      // load dependencies of main project from within packages
      path.resolve(__dirname, "../node_modules"),
      // load dependencies of packages themselves
      "node_modules"
    ]
  },
  node: {
    fs: "empty" // Jison loader fails otherwise
  },
  devServer: {
    // TODO: https://webpack.js.org/configuration/dev-server/#devserver-hot
    contentBase: path.join(__dirname, "../dist"),
    open: false,
    overlay: true,
    port: 4200,
    proxy: require("./proxy.dev.js")
  },
  plugins: [
    new DefinePlugin({
      "process.env.LATER_COV": false
    }),
    new ExtractTextPlugin({
      filename: "[name].[contenthash].css",
      disable: process.env.NODE_ENV !== "production"
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html"
    })
  ],
  module: {
    rules: [
      {
        test: /\.html$/,
        use: {
          loader: "html-loader",
          options: {
            attrs: ["link:href"]
          }
        }
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "thread-loader"
          },
          {
            loader: "ts-loader",
            options: {
              happyPackMode: true
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          "thread-loader",
          {
            loader: "babel-loader",
            options: {
              presets: requireAll([
                "babel-preset-es2015",
                "babel-preset-stage-3",
                "babel-preset-react"
              ])
            }
          }
        ]
      },
      {
        test: /\.(svg|png|jpg|gif|ico|icns)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "./[hash]-[name].[ext]"
            }
          },
          {
            loader: "image-webpack-loader",
            options: {
              disable: process.env.NODE_ENV !== "production"
            }
          }
        ]
      },
      {
        test: /\.(ttf|woff)$/,
        loader: "file-loader",
        options: {
          name: "./fonts/source-sans-pro/[name].[ext]"
        }
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: "cache-loader",
              options: {
                cacheDirectory: "./node_modules/.cache/cache-loader"
              }
            },
            {
              loader: "css-loader",
              options: {
                sourceMap: true
              }
            },
            {
              loader: "postcss-loader",
              options: {
                sourceMap: true,
                config: {
                  path: path.join(__dirname, "../postcss.config.js")
                }
              }
            },
            {
              loader: "less-loader",
              options: {
                sourceMap: true,
                plugins: [LessColorLighten]
              }
            }
          ],
          // use style-loader in development
          fallback: "style-loader"
        })
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
