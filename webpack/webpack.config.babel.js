import autoprefixer from 'autoprefixer';
import colorLighten from 'less-color-lighten';
import fs from 'fs';
import glob from 'glob';
import less from 'less';
import path from 'path';
import postcss from 'postcss';
import purifycss from 'purify-css';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import StringReplacePlugin from 'string-replace-webpack-plugin';
import SVGSprite from 'svg-sprite';
import vinyl from 'vinyl';

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
  }, function (error, output) {
    if (error) {
      console.log(error);
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
  let Module = module.constructor;
  let sourceModule = new Module();
  sourceModule._compile(src, filename);
  return sourceModule.exports;
}

let bootstrap = {
  CSS:'',
  HTML: ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconDCOSLogoMark)
  )
};

let svgSpriter = new SVGSprite({
  mode: {
    symbol: true
  },
  shape: {
    id: {
      separator: '--'
    }
  }
});

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
              replacement: function () {
                return (
                  '<div id="canvas">' +
                    '<div class="application-loading-indicator container ' +
                      'container-pod vertical-center">' +
                      bootstrap.HTML +
                    '</div>' +
                  '</div>'
                );
              }
            },
            {
              pattern: /<!--\sICON-SVG-SPRITESHEET\s-->/g,
              replacement: function () {
                let content = null;
                let baseDir = path.resolve('src/img/components/icons');
                let files = glob.sync('**/*.svg', {cwd: baseDir});

                files.forEach(function(file){
                  svgSpriter.add(new vinyl({
                    path: path.join(baseDir, file),
                    base: baseDir,
                    contents: fs.readFileSync(path.join(baseDir, file))
                  }));
                })

                svgSpriter.compile(function(error, result, data){
                  content = result.symbol.sprite.contents.toString();
                });

                return (
                  '<div style="height: 0; overflow: hidden; width: 0;' +
                    ' visibility: hidden;">' +
                    content +
                  '</div>'
                );
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
        loader: 'file?name=./[hash]-[name].[ext]',
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
