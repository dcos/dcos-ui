var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './src/raml-validator-loader.js',
  output: {
    path: path.join(__dirname, 'lib'),
    filename: 'raml-validator-loader.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  externals: [
    'crypto',
    'fs',
    'path',
    'raml-1-parser',
    'raml-typesystem',
    'raml-definition-system',
    'raml-json-validation',
    'raml-xml-validation',
  ]
};
