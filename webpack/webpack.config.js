var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var StringReplacePlugin = require('string-replace-webpack-plugin');

module.exports = require('./make-webpack-config')({
  devtool: '#eval-source-map',
  output: {
    path: './build',
    filename: 'index.js'
  },
  plugins: [
    new StringReplacePlugin(),

    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),

    new ExtractTextPlugin('[name].css')
  ]
});
