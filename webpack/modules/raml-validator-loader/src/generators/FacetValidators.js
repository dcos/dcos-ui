import FragmentFactory from '../utils/FragmentFactory';

const FACET_FRAGMENT_GENERATORS = {

  /**
   * [Number]  `maximum`: Maximum numeric value
   *
   * @param {String} value - The facet value
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The facet validator code lines
   */
  maximum(value, context) {
    context.useError('NUMBER_MAX');

    return FragmentFactory.testAndPushError(
      `value > ${value}`,
      'NUMBER_MAX',
      { value }
    );
  },

  /**
   * [Number] `minimum`: Minimum numeric value
   *
   * @param {String} value - The facet value
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The facet validator code lines
   */
  minimum(value, context) {
    context.useError('NUMBER_MIN');

    return FragmentFactory.testAndPushError(
      `value < ${value}`,
      'NUMBER_MIN',
      { value }
    );
  },

  /**
   * [Number] `format` : The format of the value
   *
   * Must be one of: int32, int64, int, long, float, double, int16, int8
   *
   * @param {String} value - The facet value
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The facet validator code lines
   */
  format(value, context) {
    const IS_INT = '(value % 1 === 0)';
    const FLOAT_HELPER = context.getConstantExpression('HELPERS',
      'new Float32Array(1)');

    let condition;
    switch (value) {
      case 'int64':
        condition = `${IS_INT}`;
        break;

      case 'int32':
        condition = `${IS_INT} && (value >= -2147483648) && (value <= 2147483647)`;
        break;

      case 'int16':
        condition = `${IS_INT} && (value >= -32768) && (value <= 32767)`;
        break;

      case 'int8':
        condition = `${IS_INT} && (value >= -128) && (value <= 127)`;
        break;

      case 'int':
        condition = `${IS_INT} && (value >= -32768) && (value <= 32767)`;
        break;

      case 'long':
        condition = `${IS_INT} && (value >= -2147483648) && (value <= 2147483647)`;
        break;

      case 'float':
        //
        // To test for Float32 we are first casting the number to an internally
        // representable Float32 number and we are then calculating the difference
        // to the original value.
        //
        // We are then checking if this difference is smaller than the number of
        // decimals in the number
        //
        condition = `Math.abs((${FLOAT_HELPER}[0] = value) - ${FLOAT_HELPER}[0])`
          + ' < Math.pow(10, -(value+\'.\').split(\'.\')[1].length-1)';
        break;

      case 'double':
        return [];
        break;

      default:
        throw new TypeError(`Unknown value for the 'format' facet: '${value}'`);
    }

    context.useError('NUMBER_TYPE');

    return FragmentFactory.testAndPushError(
      `!(${condition})`,
      'NUMBER_TYPE',
      { type: value }
    );
  },

  /**
   * [Number] `multipleOf` : Value must be divisible by this value
   *
   * @param {String} value - The facet value
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The facet validator code lines
   */
  multipleOf(value, context) {
    context.useError('NUMBER_MULTIPLEOF');

    return FragmentFactory.testAndPushError(
      `value % ${value} !== 0`,
      'NUMBER_MULTIPLEOF',
      { value }
    );
  },

  /**
   * [String] `pattern`: Regular expression this value should match against
   *
   * @param {String} value - The facet value
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The facet validator code lines
   */
  pattern(value, context) {
    const REGEX = context.getConstantExpression(
      'REGEX', `new RegExp('${value.replace(/'/g, '\\\'')}')`
    );

    context.useError('STRING_PATTERN');

    return FragmentFactory.testAndPushError(
      `!${REGEX}.exec(value)`,
      'STRING_PATTERN',
      { pattern: value }
    );
  },

  /**
   * [String] `minLength`: Minimum length of the string
   *
   * @param {String} value - The facet value
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The facet validator code lines
   */
  minLength(value, context) {
    context.useError('LENGTH_MIN');

    return FragmentFactory.testAndPushError(
      `value.length < ${value}`,
      'LENGTH_MIN',
      { value }
    );
  },

  /**
   * [String] `maxLength`: Maximum length of the string
   *
   * @param {String} value - The facet value
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The facet validator code lines
   */
  maxLength(value, context) {
    context.useError('LENGTH_MAX');

    return FragmentFactory.testAndPushError(
      `value.length > ${value}`,
      'LENGTH_MAX',
      { value }
    );
  },

  /**
   * [Array] `minItems` : Minimum amount of items in the array
   *
   * @param {String} value - The facet value
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The facet validator code lines
   */
  minItems(value, context) {
    context.useError('ITEMS_MIN');

    return FragmentFactory.testAndPushError(
      `value.length < ${value}`,
      'ITEMS_MIN',
      { value }
    );
  },

  /**
   * [Array] `maxItems` : Maximum amount of items in the array
   *
   * @param {String} value - The facet value
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The facet validator code lines
   */
  maxItems(value, context) {
    context.useError('ITEMS_MAX');

    return FragmentFactory.testAndPushError(
      `value.length > ${value}`,
      'ITEMS_MAX',
      { value }
    );
  },

  /**
   * [Array] `uniqueItems` : All array items MUST be unique
   *
   * @param {Boolean} value - True if the items must be unique
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The facet validator code lines
   */
  uniqueItems(value, context) {
    context.useError('ITEMS_UNIQUE');

    return [
      'if ((function() {',
      '\tvar valuesSoFar = Object.create(null);',
      '\tfor (var i = 0; i < value.length; ++i) {',
      '\t\tvar val = value[i];',
      '\t\tif (val in valuesSoFar) {',
      '\t\t\treturn true;',
      '\t\t}',
      '\t\tvaluesSoFar[val] = true;',
      '\t}',
      '\treturn false;',
      '})()) {',
      '\terrors.push(new RAMLError(path, context, "ITEMS_UNIQUE"));',
      '}'
    ];
  },

  /**
   * [Array] `items` : Type for the items
   *
   * @param {String} value - The facet value
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The facet validator code lines
   */
  items(value, context) {

    // The value passed is an `InheritedType` instance, that describes the
    // RAML metadata. In order to access the underlying run-time information,
    // that we operate upon, we need to use `extras.normal` to access it:
    var itype = value.extras.nominal;
    const validatorFn = context.uses(itype);

    // Validate every child
    return [
      'errors = value.reduce(function(errors, value, i) {',
      '\treturn errors.concat(',
      `\t\t${validatorFn}(value, path.concat([i]))`,
      '\t);',
      '}, errors);'
    ];
  },

  //
  // Object facets from here:
  // https://github.com/raml-org/raml-spec/blob/master/versions/raml-10/raml-10.md#object-type
  //

  /**
   * [Object] `minProperties`: Minimum number of properties
   *
   * @param {String} value - The facet value
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The facet validator code lines
   */
  minProperties(value, context) {
    context.useError('PROPS_MIN');

    return FragmentFactory.testAndPushError(
      `Object.keys(value).length < ${value}`,
      'PROPS_MIN',
      { value }
    );
  },

  /**
   * [Object] `maxProperties`: Maximum number of properties
   *
   * @param {String} value - The facet value
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The facet validator code lines
   */
  maxProperties(value, context) {
    context.useError('PROPS_MAX');

    return FragmentFactory.testAndPushError(
      `Object.keys(value).length > ${value}`,
      'PROPS_MAX',
      { value }
    );
  },

  /**
   * [General] `enum`: Enumeration of the given values
   *
   * @param {Array} values - The enum options
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The facet validator code lines
   */
  enum(values, context) {
    context.useError('ENUM');

    // If we have caseInsensitiveEnums option defined, convert everything
    // in lower-case and also use a lower-case test
    if (context.options.caseInsensitiveEnums) {
      const LOWER_VALUES = values.map((value) => String(value).toLowerCase());
      const ENUM_STRING = LOWER_VALUES.join(', ');
      const ENUM = context.getConstantExpression(
        'ENUMS', JSON.stringify(LOWER_VALUES));

      return FragmentFactory.testAndPushError(
        `${ENUM}.indexOf(value.toLowerCase()) === -1`,
        'ENUM',
        { values: ENUM_STRING }
      );
    }

    const ENUM = context.getConstantExpression('ENUMS', JSON.stringify(values));
    const ENUM_STRING = values.map((value) => String(value)).join(', ');

    return FragmentFactory.testAndPushError(
      `${ENUM}.indexOf(value) === -1`,
      'ENUM',
      { values: ENUM_STRING }
    );
  },

  /**
   * This is only a placeholder in order to avoid throwing an error
   * when this facet is encountered.
   *
   * Implemented in the HighOrderComposers, since it's not so simple to be
   * implemented as a facet validator.
   *
   * @return {Array} - The facet validator code lines
   */
  additionalProperties() {
    return [];
  }

};

module.exports = {

  /**
   * Generate an array of code fragments that perform the validations as
   * described in the `facets` object.
   *
   * @param {Object} facets - The object with the facet names and values
   * @param {GeneratorContext} context - The generator context
   *
   * @returns {Array} Returns an array of validator code fragments
   */
  generateFacetFragments(facets, context) {
    const keys = Object.keys(facets);

    return keys.reduce(function (fragments, facet) {
      if (FACET_FRAGMENT_GENERATORS[facet] == null) {
        throw new TypeError(`Unknown facet: '${facet}'`);
      }

      return fragments.concat(
        FACET_FRAGMENT_GENERATORS[facet]( facets[facet], context )
      );
    }, []);
  }

};
