import autoprefixer from "autoprefixer";
import colorLighten from "less-color-lighten";
import fs from "fs";
import less from "less";
import path from "path";
import postcss from "postcss";
import purifycss from "purify-css";
import React from "react";
import ReactDOMServer from "react-dom/server";
import StringReplacePlugin from "string-replace-webpack-plugin";

import IconDCOSLogoMark from "../src/js/components/icons/IconDCOSLogoMark.js";

function absPath() {
  const args = [].slice.apply(arguments);
  args.unshift(__dirname, "..");

  return path.resolve.apply(path.resolve, args);
}

// Can override this with npm config set externalplugins ../some/relative/path/to/repo
const externalPluginsDir = absPath(
  process.env.npm_config_externalplugins || "plugins"
);

new Promise(function(resolve, reject) {
  const cssEntryPoint = path.join(__dirname, "../src/styles/index.less");
  less.render(
    fs.readFileSync(cssEntryPoint).toString(),
    {
      filename: cssEntryPoint,
      plugins: [colorLighten]
    },
    function(error, output) {
      if (error) {
        console.log(error);
        process.exit(1);
      }

      const prefixer = postcss([autoprefixer]);
      prefixer
        .process(output.css)
        .then(function(prefixed) {
          resolve(prefixed.css);
        })
        .catch(reject);
    }
  );
}).then(function(css) {
  bootstrap.CSS = css;
});

function requireFromString(src, filename = "") {
  const Module = module.constructor;
  const sourceModule = new Module();
  sourceModule._compile(src, filename);

  return sourceModule.exports;
}

const bootstrap = {
  CSS: "",
  HTML: ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconDCOSLogoMark)
  )
};

module.exports = {
  lessLoader: {
    lessPlugins: [colorLighten]
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
              pattern: /<!--\[if\sBOOTSTRAP-HTML\]><!\[endif\]-->/g,
              replacement() {
                return (
                  '<div class="application-loading-indicator ' +
                  'vertical-center">' +
                  bootstrap.HTML +
                  "</div>"
                );
              }
            }
          ]
        })
      },
      {
        test: /\.js$/,
        loader: "source-map-loader",
        exclude: /node_modules/
      }
    ],
    loaders: [
      {
        test: /\.html$/,
        loader: "html?attrs=link:href"
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      },
      {
        test: /\.jison$/,
        loader: "jison-loader"
      },
      {
        test: /\.raml$/,
        loader: "raml-validator-loader"
      },
      {
        test: /\.(ico|icns)$/,
        loader: "file?name=./[hash]-[name].[ext]"
      },
      {
        test: /\.(ttf|woff)$/,
        loader: "file?name=./fonts/source-sans-pro/[name].[ext]"
      }
    ],
    postLoaders: [
      {
        test: /\.html$/,
        exclude: /node_modules/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /<!--\[if\sBOOTSTRAP-CSS\]><!\[endif\]-->/g,
              replacement(match, id, htmlContents) {
                // Remove requires() that were injected by webpack
                htmlContents = htmlContents.replace(
                  /"\s+\+\s+require\(".*?"\)\s+\+\s+"/g,
                  ""
                );
                // Load as if it were a module.
                const compiledHTML = requireFromString(htmlContents);

                const css = purifycss(compiledHTML, bootstrap.CSS, {
                  minify: true
                });

                // Webpack doo doo's its pants with some of this CSS for
                // some stupid reason. So this is why we encode the CSS.
                const encoded = new Buffer(css).toString("base64");
                const js = `var css = '${encoded}';css = atob(css);var tag = window.document.createElement('style');tag.innerHTML = css;window.document.head.appendChild(tag);`;

                return `<script>${js}</script>`;
              }
            }
          ]
        })
      }
    ]
  },

  node: {
    fs: "empty"
  },

  postcss: [autoprefixer],

  resolve: {
    alias: {
      PluginSDK: absPath("src/js/plugin-bridge/PluginSDK"),
      PluginTestUtils: absPath("src/js/plugin-bridge/PluginTestUtils"),
      EXTERNAL_PLUGINS: externalPluginsDir,
      PLUGINS: absPath("plugins"),
      "foundation-ui": absPath("foundation-ui")
    },
    extensions: ["", ".js", ".less", ".css"],
    root: [absPath(), absPath("node_modules")]
  },

  resolveLoader: {
    root: absPath("node_modules")
  }
};
