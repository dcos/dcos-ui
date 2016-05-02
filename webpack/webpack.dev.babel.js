import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import StringReplacePlugin from 'string-replace-webpack-plugin';
import WebpackNotifierPlugin from 'webpack-notifier';

import packageInfo from '../package';
import webpackConfig from './webpack.config.babel';

let PORT = process.env.PORT || 8080;
let proxy;

try {
  // If this fails - you should create a proxy.dev.js by copying proxy.template.js
  // and customizing the proxy as needed.
  proxy = require('./proxy.dev.js');
} catch (err) {
  proxy = require('./proxy.template.js');
}

let REPLACEMENT_VARS = {
  VERSION: packageInfo.version,
  ENV: process.env.NODE_ENV,
  ANALYTICS_KEY: packageInfo.analytics.development
};

module.exports = Object.assign({}, webpackConfig, {
  entry: [
    'webpack-dev-server/client?http://localhost:' + PORT,
    'webpack/hot/only-dev-server',
    './src/js/index.js'
  ],
  devtool: '#eval-source-map',
  output: {
    path: './build',
    filename: 'index.js'
  },
  devServer: {
    proxy: proxy
  },
  plugins: [
    new StringReplacePlugin(),

    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),

    new ExtractTextPlugin('[name].css'),

    new WebpackNotifierPlugin()
  ],
  module: {
    preLoaders: webpackConfig.module.preLoaders,
    loaders: webpackConfig.module.loaders.concat([
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'react-hot!babel?' + JSON.stringify({
          cacheDirectory: true,
          // Map through resolve to fix preset loading problem
          presets: [
            'babel-preset-es2015',
            'babel-preset-react'
          ].map(require.resolve),
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
        loader: 'file?name=[hash]-[name].[ext]&limit=100000&mimetype=image/png'
      },
      {
        test: /\.svg$/,
        loader: 'file?name=[hash]-[name].[ext]&limit=100000&mimetype=image/svg+xml',
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
    ])
  }
});
