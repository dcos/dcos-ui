import fs from 'fs';
import glob from 'glob';
import path from 'path';
import SVGSprite from 'svg-sprite';
import vinyl from 'vinyl';

function SVGCompilerPlugin(options) {
  this.options = {baseDir: path.resolve(options.baseDir)};
}

SVGCompilerPlugin.prototype.apply = function(compiler) {
  var baseDir = this.options.baseDir;

  compiler.plugin('emit', function(compilation, callback) {
    let content = null;
    let files = glob.sync('**/*.svg', {cwd: baseDir});
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

    files.forEach(function (file) {
      svgSpriter.add(new vinyl({
        path: path.join(baseDir, file),
        base: baseDir,
        contents: fs.readFileSync(path.join(baseDir, file))
      }));
    });

    svgSpriter.compile(function (error, result, data) {
      content = result.symbol.sprite.contents.toString();
    });

    // Insert this list into the Webpack build as a new file asset:
    compilation.assets['sprite.svg'] = {
      source: function() {
        return content;
      },
      size: function() {
        return content.length;
      }
    };

    callback();
  });
};

module.exports = SVGCompilerPlugin;
