import autoprefixer from 'autoprefixer';
import colorLighten from 'less-color-lighten';
import path from 'path';

function absPath() {
  let args = [].slice.apply(arguments);
  args.unshift(__dirname, '..');

  return path.resolve.apply(path.resolve, args);
}

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
      EXTERNAL_PLUGINS: absPath(String(process.env.DCOS_UI_PLUGINS || 'plugins')),
      PLUGINS: absPath('plugins')
    },
    extensions: ['', '.js', '.less', '.css'],
    root: [absPath(), absPath('node_modules')]
  },

  resolveLoader: {
    root: absPath('node_modules')
  },
};
