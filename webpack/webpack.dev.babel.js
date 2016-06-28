import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import StringReplacePlugin from 'string-replace-webpack-plugin';
import WebpackNotifierPlugin from 'webpack-notifier';

import packageInfo from '../package';
import webpackConfig from './webpack.config.babel';

// Defaults to value in package.json.
// Can override with npm config set port 80
let PORT = parseInt(process.env.npm_package_config_port, 10);
let environment = process.env.NODE_ENV;
let devtool = null;
let devServer = {
  proxy: require('./proxy.dev.js'),
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

let REPLACEMENT_VARS = {
  VERSION: packageInfo.version,
  ENV: environment
};

let entry = [
  `webpack-dev-server/client?http://localhost:${PORT}`,
  './src/js/index.js'
];

if (environment === 'development') {
  entry.push('webpack/hot/only-dev-server');
  devtool = '#eval-source-map';
} else if (environment === 'testing') {
  // Cypress constantly saves fixture files, which causes webpack to detect
  // a filechange and rebuild the application. The problem with this is that
  // when Cypress goes to load the application again, it may not be ready to
  // be served, which causes the test to fail. This delays rebuilding the
  // application for a very long time when in a testing environment.
  let delayTime = 1000 * 60 * 60 * 5;
  devServer.watchOptions = {
    aggregateTimeout: delayTime,
    poll: delayTime
  };
}

module.exports = Object.assign({}, webpackConfig, {
  entry,
  devtool,
  output: {
    path: './build',
    filename: 'index.js'
  },
  devServer,
  plugins: [
    new StringReplacePlugin(),

    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),

    new ExtractTextPlugin('[name].css'),

    new WebpackNotifierPlugin({alwaysNotify: true})
  ],
  module: {
    preLoaders: webpackConfig.module.preLoaders,
    loaders: webpackConfig.module.loaders.concat([
      {
        test: /\.js$/,
        // Exclude all node_modules except dcos-dygraphs
        exclude: /(?=\/node_modules\/)(?!\/node_modules\/dcos-dygraphs\/)/,
        loader: 'react-hot!babel?' + JSON.stringify({
          cacheDirectory: true,
          // Map through resolve to fix preset loading problem
          presets: [
            'babel-preset-es2015',
            'babel-preset-react'
          ].map(require.resolve)
        })
      },
      {
        test: /\.css$/,
        loader: 'style!css!postcss'
      },
      {
        test: /\.less$/,
        loader: 'style!css!postcss!less'
      },
      {
        test: /\.png$/,
        loader: 'file?name=./[hash]-[name].[ext]&limit=100000&mimetype=image/png'
      },
      {
        test: /\.svg$/,
        loader: 'file?name=[hash]-[name].[ext]&limit=100000&mimetype=image/svg+xml'
      },
      {
        test: /\.gif$/,
        loader: 'file?name=[hash]-[name].[ext]&limit=100000&mimetype=image/gif',
      },
      {
        test: /\.jpg$/,
        loader: 'file?name=[hash]-[name].[ext]',
      },
      // Replace @@variables
      {
        test: /.js$/,
        exclude: /node_modules/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /@@(\w+)/ig,
              replacement: function (match, key) {
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
