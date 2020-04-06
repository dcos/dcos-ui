const { DefinePlugin, EnvironmentPlugin } = require("webpack");
const path = require("path");
const LessColorLighten = require("less-color-lighten");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const devServer = {
  open: false,
  overlay: true,
  port: 4200,
  proxy: require("./proxy.dev.js"),
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
    poll: delayTime,
  };
  devServer.proxy = {};
}

const babelLoader = {
  loader: "babel-loader",
  options: {
    cacheDirectory: true,
    // babel-loader does not load the projects babel-config by default for some reason.
    babelrc: true,
  },
};

module.exports = {
  devServer,
  entry: "./src/js/index.tsx",
  output: {
    filename: "[name].[hash].js",
    chunkFilename: "[name].[chunkhash].bundle.js",
  },
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      chunks: "all",
    },
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@styles": path.resolve(__dirname, "../src/styles"),
    },
    modules: [
      // include packages
      path.resolve(__dirname, "../packages"),
      // load dependencies of main project from within packages
      path.resolve(__dirname, "../node_modules"),
      // load dependencies of packages themselves
      "node_modules",
    ],
  },
  node: {
    fs: "empty", // Jison-generated files fail otherwise
  },
  plugins: [
    new EnvironmentPlugin(["NODE_ENV"]),
    new DefinePlugin({
      "process.env.LATER_COV": false, // prettycron fails otherwise
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[hash].css",
      disable: process.env.NODE_ENV !== "production",
    }),
  ],
  module: {
    rules: [
      { test: /\.html$/, use: { loader: "html-loader" } },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          // we currently need babel here, as lingui relies on babel-transforms.
          babelLoader,
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: (absPath) =>
          absPath.includes("/node_modules/") &&
          // this package needs to be babelized to work in browsers.
          !absPath.includes("/objektiv/"),
        use: [babelLoader],
      },
      {
        test: /\.(svg|png|jpg|gif|ico|icns)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "./[hash]-[name].[ext]",
              esModule: false,
            },
          },
          {
            loader: "image-webpack-loader",
            options: {
              disable: process.env.NODE_ENV !== "production",
            },
          },
        ],
      },
      {
        test: /\.(less|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "cache-loader",
            options: {
              cacheDirectory: "./node_modules/.cache/cache-loader",
            },
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: true,
              config: {
                path: path.join(__dirname, "../postcss.config.js"),
              },
            },
          },
          {
            loader: "less-loader",
            options: {
              sourceMap: true,
              plugins: [LessColorLighten],
            },
          },
        ],
      },
      {
        test: /\.raml$/,
        loader: "raml-validator-loader",
      },
    ],
  },
};
