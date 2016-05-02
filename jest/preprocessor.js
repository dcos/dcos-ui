var babel = require('babel-core');
var jestPreset = require('babel-preset-jest');
var webpackAlias = require('jest-webpack-alias');

module.exports = {
  // Gets called by jest during test prep for every module.
  // src is the raw module content as a String.
  process: function (src, filename) {
    // Don't bother doing anything to node_modules
    if (filename.indexOf('node_modules') === -1) {
      // Run our modules through Babel before running tests
      if (babel.util.canCompile(filename)) {
        src = babel.transform(src, {
          auxiliaryCommentBefore: ' istanbul ignore next ',
          filename,
          presets: [jestPreset].concat([
            'babel-preset-es2015',
            'babel-preset-react'
          ].map(require.resolve)),
          retainLines: true,
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
