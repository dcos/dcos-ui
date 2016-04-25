var packageInfo = require('../package');
var path = require('path');
/*
  Plugins
 */
var autoprefixer = require('autoprefixer');
var colorLighten = require('less-color-lighten');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var StringReplacePlugin = require('string-replace-webpack-plugin');

var analyticsKey = packageInfo.analytics.development;

function absPath() {
  var args = [].slice.apply(arguments);
  args.unshift(__dirname, '..');

  return path.resolve.apply(path.resolve, args);
}

function extractForProduction(loaders) {
  return ExtractTextPlugin.extract('style', loaders.substr(loaders.indexOf('!')));
}

module.exports = function (options) {
  var cssLoaders = 'style!css!postcss';
  var scssLoaders = cssLoaders + '!sass';
  var sassLoaders = scssLoaders + '?indentedSyntax=sass';
  var lessLoaders = cssLoaders + '!less';

  if (options.production) {
    cssLoaders = extractForProduction(cssLoaders);
    sassLoaders = extractForProduction(sassLoaders);
    scssLoaders = extractForProduction(scssLoaders);
    lessLoaders = extractForProduction(lessLoaders);

    analyticsKey = packageInfo.analytics.production;
  }

  var VARS = {
    VERSION: packageInfo.version,
    ENV: process.env.NODE_ENV,
    ANALYTICS_KEY: analyticsKey
  };

  function addImageOptimizer(loader) {
    if (options.production) {
      return loader + '!image-webpack?' + JSON.stringify({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}]
      });
    }

    return loader;
  }

  return {
    entry: options.entry,

    devServer: options.devServer || {},

    debug: !options.production,

    devtool: options.devtool,

    output: {
      path: options.output.path,
      filename: options.output.filename
    },

    lessLoader: {
      lessPlugins: [
        colorLighten
      ]
    },

    module: {
      preLoaders: [
        {
          test: /\.js$/,
          loader: 'eslint-loader',
          exclude: /node_modules/
        },
        {
          test: /\.js$/,
          loader: 'source-map-loader',
          exclude: /node_modules/
        }
      ],
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loaders: ['react-hot', 'babel'],
          query: {
            cacheDirectory: true,
            // Map through resolve to fix preset loading problem
            presets: [
              'babel-preset-es2015',
              'babel-preset-react'
            ].map(require.resolve),
          }
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
                  return VARS[key];
                }
              }
            ]
          })
        },
        {
          test: /\.html$/,
          loader: 'html?attrs=link:href'
        },
        {
          test: /\.json$/,
          loader: 'json-loader'
        },
        {
          test: /\.css$/,
          loader: cssLoaders,
        },
        {
          test: /\.sass$/,
          loader: sassLoaders,
        },
        {
          test: /\.scss$/,
          loader: scssLoaders,
        },
        {
          test: /\.less$/,
          loader: lessLoaders,
        },
        {
          test: /\.png$/,
          loader: addImageOptimizer('file?name=[hash]-[name].[ext]&limit=100000&mimetype=image/png')
        },
        {
          test: /\.svg$/,
          loader: addImageOptimizer('file?name=[hash]-[name].[ext]&limit=100000&mimetype=image/svg+xml'),
        },
        {
          test: /\.gif$/,
          loader: addImageOptimizer('file?name=[hash]-[name].[ext]&limit=100000&mimetype=image/gif'),
        },
        {
          test: /\.(ico|icns)$/,
          loader: 'file?name=[hash]-[name].[ext]',
        },
        {
          test: /\.jpg$/,
          loader: addImageOptimizer('file?name=[hash]-[name].[ext]'),
        },
      ]
    },
    plugins: options.plugins,

    postcss: [autoprefixer],

    resolve: {
      alias: {
        PluginSDK: absPath('src/js/plugin-bridge/PluginSDK'),
        PluginTestUtils: absPath('src/js/plugin-bridge/PluginTestUtils'),
        EXTERNAL_PLUGINS: absPath(String(process.env.DCOS_UI_PLUGINS || 'plugins')),
        PLUGINS: absPath('plugins')
      },
      extensions: ['', '.js', '.sass', '.scss', '.less', '.css'],
      root: [absPath(), absPath('node_modules')]
    },

    resolveLoader: {
      root: absPath('node_modules')
    },
  };
};
