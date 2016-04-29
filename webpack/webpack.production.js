var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var StringReplacePlugin = require('string-replace-webpack-plugin');
var webpack = require('webpack');

module.exports = require('./make-webpack-config')({
  entry: './src/js/index.js',
  devtool: '#source-map',
  production: true,
  output: {
    path: './dist',
    filename: 'index.[hash].js'
  },
  plugins: [
    // Important to keep React file size down
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
      },
    }),

    new webpack.optimize.DedupePlugin(),

    new StringReplacePlugin(),

    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),

    new ExtractTextPlugin('[name].[hash].css'),

    new HtmlWebpackPlugin({
      template: './src/index.html',
      production: true,
    }),

    // Don't include images in /icons/_exports
    new webpack.IgnorePlugin(/icons\/_exports\//)

  ]
});
