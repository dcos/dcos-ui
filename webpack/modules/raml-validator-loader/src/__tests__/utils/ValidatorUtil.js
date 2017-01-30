const RAML = require('raml-1-parser');
const Generator = require('../../Generator');
const GeneratorContext = require('../../GeneratorContext');

module.exports = {

  /**
   * Utility function that parses RAML on-the-fly, generates a validator object
   * and returns the validation function
   *
   * @param {String} ramlDocument - The contents of the RAML document
   * @param {Object} options - Transpiler options
   * @param {String} typeName - The name of the type to extract a validator for
   * @returns {function} Returns the validator function reference
   */
  createValidator(ramlDocument, options={}, typeName='TestType') {
    var raml = RAML.parseRAMLSync(ramlDocument);
    var types = raml.types().reduce(function (types, type) {
      types[type.name()] = type;

      return types;
    }, {});

    // Generate code with the given type
    var context = new GeneratorContext(options);
    context.uses( types[typeName].runtimeType() );

    // Generate code
    var code = Generator.generate(context);
    /* eslint-disable no-eval */
    var typeValidators = eval(code.replace('module.exports = ', ''));
    /* eslint-enable no-eval */

    // Return the validator for this type
    typeValidators[typeName].code = code;

    return typeValidators[typeName];
  }

};
