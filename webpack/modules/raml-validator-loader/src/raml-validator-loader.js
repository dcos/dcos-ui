import fs from 'fs';
import path from 'path';
import RAML from 'raml-1-parser';

import Generator from './Generator';
import GeneratorContext from './GeneratorContext';

/**
 * Entry point of the raml-validator-loader
 */
module.exports = function(source) {

  // Mark the contents cacheable
  this.cacheable();

  // Override the default filesystem resolver in order to:
  //
  // 1) Provide a custom content for the source file
  // 2) Track dependant files in order for webpack to invalidate caches
  //
  var raml = RAML.loadApiSync(this.resourcePath, {
    fsResolver: {
      content: (function(path) {
        if (path == this.resourcePath) {
          return source;
        }

        this.addDependency(path);
        return fs.readFileSync(path).toString();
      }).bind(this)
    }
  });

  // Prepare generator context
  var ctx = new GeneratorContext();

  // Use all types in this RAML specification
  raml.types().forEach(function(type) {
    ctx.uses( type.runtimeType() );
  });

  // Generate source
  return Generator.generate(ctx);

};
