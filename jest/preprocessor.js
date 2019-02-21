var babel = require("babel-core");
var jestPreset = require("babel-preset-jest");
var jison = require("jison");
var webpackAlias = require("jest-webpack-alias");
const tsc = require("typescript");
const tsConfig = require("../tsconfig.json");

module.exports = {
  // Gets called by jest during test prep for every module.
  // src is the raw module content as a String.
  process(src, filename) {
    var isJISON = filename.match(/\.jison$/i);
    // Don't bother doing anything to node_modules
    if (filename.indexOf("node_modules") === -1) {
      // Don't load image data - it can't be parsed by jest.
      if (filename.match(/\.(jpe?g|png|gif|bmp|svg|less|raml)$/i)) {
        return "";
      }
      // Use JISON generator for JISON grammar
      if (isJISON) {
        src = new jison.Generator(src).generate();
      }
      if (filename.endsWith(".ts") || filename.endsWith(".tsx")) {
        src = tsc.transpile(src, tsConfig.compilerOptions, filename, []);
      }
      // Run our modules through Babel before running tests
      if (
        babel.util.canCompile(filename) ||
        isJISON ||
        filename.endsWith(".ts") ||
        filename.endsWith(".tsx")
      ) {
        src = babel.transform(src, {
          auxiliaryCommentBefore: " istanbul ignore next ",
          filename,
          presets: [jestPreset].concat(
            [
              "babel-preset-env",
              "babel-preset-stage-3",
              "babel-preset-react"
            ].map(require.resolve)
          ),
          retainLines: true
        }).code;
      }
      // Run our modules through the jest-webpack-alias plugin so we
      // can use the webpack alias in tests. By default, jest doesn't work
      // with webpack at all. webPackAlias matches filenames against the
      // alias settings in webpack.config and rewrites the filename to the
      // aliased path.
      src = webpackAlias.process(src, filename);
    }

    return src;
  }
};
