var config = require('./.build.config');
var path = require('path');
var webpack = require('webpack');

var webpackDevtool = '#source-map';
var webpackWatch = false;
if (process.env.NODE_ENV === 'development') {
  // eval-source-map is the same thing as source-map,
  // except with caching. Don't use in production.
  webpackDevtool = '#eval-source-map';
  webpackWatch = true;
}

var vendors = [
  'classnames',
  'cookie',
  'd3',
  'deep-equal',
  'flux',
  'less-color-lighten',
  'md5',
  'mesosphere-shared-reactjs',
  'moment',
  'query-string',
  'react',
  'react-addons-css-transition-group',
  'react-addons-test-utils',
  'react-dom',
  'react-gemini-scrollbar',
  'react-redux',
  'react-router',
  'reactjs-components',
  'reactjs-mixin',
  'redux',
  'underscore'
];

/**
 * Build into 3 chunks to make use of parallel download.
 */

module.exports = {
  devtool: webpackDevtool,
  entry: {
    index: [config.files.srcJS],
    vendor: vendors
  },
  output: {
    path: config.dirs.dist,
    filename: '[name].js'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js', Infinity)
  ],
  module: {
    loaders: [{
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        cacheDirectory: true
      },
      test: /\.js$/
    },
    { test: /\.json$/, loader: 'json-loader' }],
    preLoaders: [
      {
        test: /\.(js)$/,
        loader: "eslint-loader",
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: /node_modules/
      }],
    postLoaders: [{
      loader: 'transform/cacheable?envify'
    }]
  },
  resolve: {
    root: path.resolve(__dirname),
    extensions: ['', '.js'],
    alias: {
      PluginSDK: 'src/js/plugin-bridge/PluginSDK',
      PluginTestUtils: 'src/js/plugin-bridge/PluginTestUtils'
    }
  },
  watch: webpackWatch
};
