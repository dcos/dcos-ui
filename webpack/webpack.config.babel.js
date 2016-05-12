import autoprefixer from 'autoprefixer';
import colorLighten from 'less-color-lighten';
import fs from 'fs';
import less from 'less';
import path from 'path';
import postcss from 'postcss';
import purifycss from 'purify-css';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import StringReplacePlugin from 'string-replace-webpack-plugin';

import IconDCOSLogoMark from '../src/js/components/icons/IconDCOSLogoMark.js';

function absPath() {
  let args = [].slice.apply(arguments);
  args.unshift(__dirname, '..');

  return path.resolve.apply(path.resolve, args);
}

// Can override this with npm config set dcos-ui:external_plugins ../some/relative/path/to/repo
let externalPluginsDir = absPath(process.env.npm_config_externalplugins || 'plugins');

new Promise(function (resolve, reject) {
  let cssEntryPoint = path.join(__dirname, '../src/styles/index.less');
  less.render(fs.readFileSync(cssEntryPoint).toString(), {
    filename: cssEntryPoint,
    plugins: [colorLighten]
  }, function (e, output) {
    if (e) {
      console.log(e);
      process.exit(1);
    }

    let prefixer = postcss([autoprefixer]);
    prefixer.process(output.css)
    .then(function (prefixed) {
      resolve(prefixed.css);
    })
    .catch(reject);
  });
}).then(function (css) {
  bootstrap.CSS = css;
});

function requireFromString(src, filename) {
  var Module = module.constructor;
  var m = new Module();
  m._compile(src, filename);
  return m.exports;
}

let bootstrap = {
  CSS:'',
  HTML: ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconDCOSLogoMark)
  )
};

module.exports = {
  lessLoader: {
    lessPlugins: [
      colorLighten
    ]
  },

  module: {
    preLoaders: [
      // Replace HTML comments
      {
        test: /\.html$/,
        exclude: /node_modules/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /<!--\sBOOTSTRAP-HTML\s-->/g,
              replacement: function (match) {
                return '<div id="canvas">' +
                  '<div class="application-loading-indicator container ' +
                    'container-pod vertical-center">' +
                    bootstrap.HTML +
                  '</div>' +
                '</div>';
              }
            }
          ]
        })
      },
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
    ],
    postLoaders: [
      {
        test: /\.html$/,
        exclude: /node_modules/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /<!--\sBOOTSTRAP-CSS\s-->/g,
              replacement: function (match, id, htmlContents) {
                // Remove requires() that were injected by webpack
                htmlContents = htmlContents
                  .replace(/"\s+\+\s+require\(".*?"\)\s+\+\s+"/g, '');
                // Load as if it were a module.
                let compiledHTML = requireFromString(htmlContents);

                let css = purifycss(compiledHTML, bootstrap.CSS, {
                  minify: true
                });

                // Webpack doo doo's its pants with some of this CSS for
                // some stupid reason. So this is why we encode the CSS.
                let encoded = new Buffer(css).toString('base64');
                let js = `var css = '${encoded}';css = atob(css);var tag = document.createElement('style');tag.innerHTML = css;document.head.appendChild(tag);`

                return `<script>${js}</script>`;
              }
            }
          ]
        })
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
