import fs from 'fs';
import RAML from 'raml-1-parser';

import Generator from './Generator';
import GeneratorContext from './GeneratorContext';

/**
 * Entry point of the raml-validator-loader
 *
 * @param {String} source - The source code of the RAML document
 * @returns {String} Returns the transpiled JS code blob
 */
module.exports = function (source) {

  // Mark the contents cacheable
  this.cacheable();

  // Override the default filesystem resolver in order to:
  //
  // 1) Provide a custom content for the source file
  // 2) Track dependent files in order for webpack to invalidate caches
  //
  const raml = RAML.loadApiSync(this.resourcePath, {
    fsResolver: {
      content: (path) => {
        if (path === this.resourcePath) {
          return source;
        }

        // When RAML loader is requesting a file, trackit as a dependency
        // so webpack can do it's magic internally.
        this.addDependency(path);

        return fs.readFileSync(path).toString();
      }
    }
  });

  // Parse URL parameters to generator configuration
  let config = {};
  if (this.query) {
    const query = this.query.substr(1);
    if (query[0] === '{') {
      config = JSON.parse(query);

    } else {
      config = query.split('&').reduce((memo, kv) => {
        let [key, value] = kv.split('=');
        if (!key) {
          return memo;
        }

        // Do some type conversion
        if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        } else if (!isNaN(value)) {
          value = Number(value);
        }

        // Keep the config
        memo[key] = value;

        return memo;
      }, {});
    }
  }

  // Prepare generator context
  const ctx = new GeneratorContext(config);

  // Use all types in this RAML specification
  raml.types().forEach((type) => {
    ctx.uses( type.runtimeType() );
  });

  // Generate source
  return Generator.generate(ctx);

};
