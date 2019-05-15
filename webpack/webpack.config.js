const { DefinePlugin, EnvironmentPlugin } = require("webpack");
const path = require("path");
const LessColorLighten = require("less-color-lighten");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const devServer = {
  open: false,
  overlay: true,
  port: 4200,
  proxy: require("./proxy.dev.js")
};

if (process.env.NODE_ENV === "testing") {
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
  devServer.proxy = {};
}

const babelLoader = {
  loader: "babel-loader",
  options: {
    cacheDirectory: true,
    // babel-loader does not load the projects babel-config by default for some reason.
    babelrc: true
  }
};

module.exports = {
  devServer,
  entry: "./src/js/index.js",
  output: {
    filename: "[name].[hash].js",
    chunkFilename: "[name].[chunkhash].bundle.js"
  },
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      chunks: "all"
    }
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      "#EXTERNAL_PLUGINS": path.resolve(
        __dirname,
        `../${process.env.npm_config_externalplugins || "../plugins"}`
      )
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
    fs: "empty" // Jison-generated files fail otherwise
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      checkSyntacticErrors: true,
      useTypescriptIncrementalApi: true
    }),
    new EnvironmentPlugin(["NODE_ENV"]),
    new DefinePlugin({
      "process.env.LATER_COV": false // prettycron fails otherwise
      "process.env.MARATHON_NAME": process.env.MARATHON_NAME || "marathon",
      "process.env.MARATHON_API_PREFIX":
        process.env.MARATHON_API_PREFIX || "/service/marathon/v2"
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[hash].css",
      disable: process.env.NODE_ENV !== "production"
    })
  ],
  module: {
    rules: [
      {
        type: "javascript/auto",
        test: /\.mjs$/,
        include: /node_modules/,
        use: []
      },
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
          // we currently need babel here, as lingui relies on babel-transforms.
          babelLoader,
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [babelLoader]
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
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
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
        ]
      },
      {
        test: /\.raml$/,
        loader: "raml-validator-loader"
      }
    ]
  }
};
