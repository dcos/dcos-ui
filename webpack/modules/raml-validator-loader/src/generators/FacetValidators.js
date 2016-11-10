import FragmentFactory from '../utils/FragmentFactory';
import RAMLUtil from '../utils/RAMLUtil';

const FACET_FRAGMENT_GENERATORS = {

  /**
   * [Number]  `maximum`: Maximum numeric value
   */
  maximum: function(value, context) {
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'NUMBER_MAX', 'Must be smaller than or equal to {value}');

    return FragmentFactory.testAndPushError(
      `value > ${value}`,
      ERROR_MESSAGE,
      { value: value }
    );
  },

  /**
   * [Number] `minimum`: Minimum numeric value
   */
  minimum: function(value, context) {
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'NUMBER_MIN', 'Must be bigger than or equal to {value}');

    return FragmentFactory.testAndPushError(
      `value < ${value}`,
      ERROR_MESSAGE,
      { value: value }
    );
  },

  /**
   * [Number] `format` : The format of the value
   *
   * Must be one of: int32, int64, int, long, float, double, int16, int8
   */
  format: function(value, context) {
    let IS_FLOAT = '(value % 1 !== 0)';
    let IS_INT   = '(value % 1 === 0)';
    let FLOAT_HELPER = context.getConstantExpression('HELPERS',
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
          + ` < Math.pow(10, -(value+'.').split('.')[1].length-1)`;
        break;

      case 'double':
        return [];
        break;

      default:
        throw new TypeError(`Unknown value for the 'format' facet: '${value}'`)
    }

    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'NUMBER_TYPE', 'Must be of type `{value}`');

    return FragmentFactory.testAndPushError(
      `!(${condition})`,
      ERROR_MESSAGE,
      { value: value }
    );
  },

  /**
   * [Number] `multipleOf` : Value must be divisable by this value
   */
  multipleOf: function(value, context) {
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'NUMBER_MULTIPLEOF', 'Must be multiple of {value}');

    return FragmentFactory.testAndPushError(
      `value % ${value} !== 0`,
      ERROR_MESSAGE,
      { value: value }
    );
  },

  /**
   * [String] `pattern`: Regular expression this value should match against
   */
  pattern: function(value, context) {
    let REGEX = context.getConstantExpression('REGEX', `/${value}/`);
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'STRING_PATTERN', 'Must match the pattern "{pattern}"');

    return FragmentFactory.testAndPushError(
      `!${REGEX}.exec(value)`,
      ERROR_MESSAGE,
      { pattern: value }
    );
  },

  /**
   * [String] `minLength`: Minimum length of the string
   */
  minLength: function(value, context) {
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'LENGTH_MIN', 'Must be at least {value} characters long');

    return FragmentFactory.testAndPushError(
      `value.length < ${value}`,
      ERROR_MESSAGE,
      { value: value }
    );
  },

  /**
   * [String] `maxLength`: Maximum length of the string
   */
  maxLength: function(value, context) {
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'LENGTH_MAX', 'Must be at most {value} characters long');

    return FragmentFactory.testAndPushError(
      `value.length > ${value}`,
      ERROR_MESSAGE,
      { value: value }
    );
  },

  /**
   * [Array] `minItems` : Minimum amount of items in the array
   */
  minItems: function(value, context) {
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'ITEMS_MIN', 'Must contain at least {value} items in the array');

    return FragmentFactory.testAndPushError(
      `value.length < ${value}`,
      ERROR_MESSAGE,
      { value: value }
    );
  },

  /**
   * [Array] `maxItems` : Maximum amount of items in the array
   */
  maxItems: function(value, context) {
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'ITEMS_MAX', 'Must contain at most {value} items in the array');

    return FragmentFactory.testAndPushError(
      `value.length > ${value}`,
      ERROR_MESSAGE,
      { value: value }
    );
  },

  /**
   * [Array] `uniqueItems` : All array items MUST be unique
   */
  uniqueItems: function(value, context) {
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'ITEMS_UNIQUE', 'Must contain only unique items');

    return [
      `if ((function() {`,
        `\tvar valuesSoFar = Object.create(null);`,
        `\tfor (var i = 0; i < value.length; ++i) {`,
          `\t\tvar val = value[i];`,
          `\t\tif (val in valuesSoFar) {`,
            `\t\t\treturn true;`,
          `\t\t}`,
          `\t\tvaluesSoFar[val] = true;`,
        `\t}`,
        `\treturn false;`,
      `})()) {`,
        `\terrors.push(new RAMLError(path, ${ERROR_MESSAGE}));`,
      `}`
    ];
  },

  /**
   * [Array] `items` : Type for the items
   */
  items: function(value, context) {

    // The value passed is an `InheritedType` instance, that describes the
    // RAML metadata. In order to access the underlying run-time information,
    // that we operate upon, we need to use `extras.normal` to access it:
    var itype = value.extras.nominal;
    let validatorFn = context.uses(itype);

    // Validate every child
    return [
      `errors = value.reduce(function(errors, value, i) {`,
      `\treturn errors.concat(`,
      `\t\t${validatorFn}(value, path.concat([i]))`,
      `\t);`,
      `}, errors);`
    ];
  },

  //
  // Object facets from here:
  // https://github.com/raml-org/raml-spec/blob/master/versions/raml-10/raml-10.md#object-type
  //

  /**
   * [Object] `minProperties`: Minimum number of properties
   */
  minProperties: function(value, context) {
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'PROPS_MIN', 'Must contain at least {value} properties in the object');

    return FragmentFactory.testAndPushError(
      `Object.keys(value).length < ${value}`,
      ERROR_MESSAGE,
      { value: value }
    );
  },

  /**
   * [Object] `maxProperties`: Maximum number of properties
   */
  maxProperties: function(value, context) {
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'PROPS_MAX', 'Must contain at most {value} properties in the object');

    return FragmentFactory.testAndPushError(
      `Object.keys(value).length > ${value}`,
      ERROR_MESSAGE,
      { value: value }
    );
  },

  /**
   * [General] `enum`: Enumeration of the given values
   */
  enum: function(values, context) {
    let ENUM = context.getConstantExpression('ENUMS', JSON.stringify(values));
    let ENUM_STRING = values.map((value) => String(value)).join(', ');
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'ENUM', 'Must be one of {values}');

    return FragmentFactory.testAndPushError(
      `${ENUM}.indexOf(value) === -1`,
      ERROR_MESSAGE,
      { values: ENUM_STRING }
    );
  },

  /**
   * (Handled by the HighOrderComposers, since it's not so simple to be
   * implemented as a fragment generator)
   */
  additionalProperties: function() {
    return [];
  }

};

module.exports = {

  /**
   * Generate an array of code fragments that perform the validataions as
   * described in the `facets` object.
   *
   * @param {Object} facets - The object with the facet names and values
   * @param {GeneratorContext} context - The generator context
   *
   * @returns {Array} Returns an array of validator code fragments
   */
  generateFacetFragments(facets, context) {
    let keys = Object.keys(facets);
    return keys.reduce(function(fragments, facet) {
      if (FACET_FRAGMENT_GENERATORS[facet] == null) {
        throw new TypeError(`Unknown facet: '${facet}'`);
      }

      return fragments.concat(
        FACET_FRAGMENT_GENERATORS[facet]( facets[facet], context )
      );
    }, []);
  }

};
