var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var StringReplacePlugin = require('string-replace-webpack-plugin');
var proxy;

try {
  // If this fails - you should create a proxy.dev.js by copying proxy.template.js
  // and customizing the proxy as needed.
  proxy = require('./proxy.dev.js');
} catch (err) {
  proxy = require('./proxy.template.js');
}

module.exports = require('./make-webpack-config')({
  entry: [
    'webpack-dev-server/client?http://localhost:8080',
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

    new webpack.HotModuleReplacementPlugin()
  ],
  hot: true
});
