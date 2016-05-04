import autoprefixer from 'autoprefixer';
import colorLighten from 'less-color-lighten';
import path from 'path';

function absPath() {
  let args = [].slice.apply(arguments);
  args.unshift(__dirname, '..');

  return path.resolve.apply(path.resolve, args);
}

// Can override this with npm config set dcos-ui:external_plugins ../some/relative/path/to/repo
let externalPluginsDir = absPath(process.env.npm_package_config_external_plugins || 'plugins');

module.exports = {
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
        test: /\.html$/,
        loader: 'html?attrs=link:href'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.(ico|icns)$/,
        loader: 'file?name=[hash]-[name].[ext]',
      }
    ]
  },

  postcss: [autoprefixer],

  resolve: {
    alias: {
      PluginSDK: absPath('src/js/plugin-bridge/PluginSDK'),
      PluginTestUtils: absPath('src/js/plugin-bridge/PluginTestUtils'),
      EXTERNAL_PLUGINS: externalPluginsDir,
      PLUGINS: absPath('plugins')
    },
    extensions: ['', '.js', '.less', '.css'],
    root: [absPath(), absPath('node_modules')]
  },

  resolveLoader: {
    root: absPath('node_modules')
  },
};
