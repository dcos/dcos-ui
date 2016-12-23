import fs from 'fs';
import glob from 'glob';
import path from 'path';
import SVGSprite from 'svg-sprite';
import vinyl from 'vinyl';

function SVGCompilerPlugin(options) {
  this.options = {baseDir: path.resolve(options.baseDir)};
}

SVGCompilerPlugin.prototype.apply = function (compiler) {
  var baseDir = this.options.baseDir;

  compiler.plugin('emit', function (compilation, callback) {
    let content = null;
    const files = glob.sync('**/*.svg', {cwd: baseDir});
    const svgSpriter = new SVGSprite({
      mode: {
        defs: true
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

    svgSpriter.compile(function (error, result) {
      content = result.defs.sprite.contents.toString();
    });

    // Insert this list into the Webpack build as a new file asset:
    compilation.assets['sprite.svg'] = {
      source() {
        return content;
      },
      size() {
        return content.length;
      }
    };

    callback();
  });
};

module.exports = SVGCompilerPlugin;
