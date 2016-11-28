const RAML = require('raml-1-parser');
const Generator = require('../../Generator');
const GeneratorContext = require('../../GeneratorContext');

module.exports = {

  /**
   * Utility function that parses RAML on-the-fly, generates a validator object
   * and returns the validation function
   */
  createValidator: function(ramlDocument, options={}, typeName='TestType') {
    var raml = RAML.parseRAMLSync(ramlDocument);
    var types = raml.types().reduce(function(types, type) {
      types[type.name()] = type;
      return types;
    }, {});

    // Generate code with the given type
    var context = new GeneratorContext(options);
    context.uses( types[typeName].runtimeType() );

    // Generate code
    var code = Generator.generate(context);
    var typeValidators = eval(code.replace('module.exports = ', ''));

    // Return the validator for this type
    typeValidators[typeName].code = code;
    return typeValidators[typeName];
  }

}
