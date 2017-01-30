import RAMLUtil from './utils/RAMLUtil';

class GeneratorContext {

  constructor(options={}) {
    // Configuration parameters that define the behavior of the parser in some
    // corner cases
    this.options = {

      /**
       * If this flag is set to `true` all pattern properties are considered
       * optional. By default the parser will query the `raml-1-parser` library,
       * and it always return `isRequired() = true`.
       *
       * @property {boolean}
       */
      patternPropertiesAreOptional: true,

      /**
       * If this flag is set to `true`, all missing properties will be emitted
       * in their path. For example, if property `foo` is missing on the object
       * `bar`, you will get an error:
       *
       * `bar.foo`: Missing property
       *
       * Instead of the default:
       *
       * `foo`: Missing property `bar`
       *
       * @property {boolean}
       */
      missingPropertiesOnTheirPath: true,

      /**
       * If this flag is set to `true` all enum comparisons will be done
       * case-insensitive.
       *
       * @property {boolean}
       */
      caseInsensitiveEnums: true

    };

    this.constantTables = {};
    this.typesProcessed = {};
    this.typesQueue = [];
    this.options = Object.assign(this.options, options);
    this.usedErrors = [];
  }

  /**
   * This function marks the given type as `required`, scheduling a validator
   * function to ge generated for it.
   *
   * This function returns a string with the expression that represents the
   * way to call the generated (or will be generated) function.
   *
   * @param {ITypeDefinition} itype - The run-time RAML type to generate a validator for
   * @returns {String} - Returns the function javascript source
   */
  uses(itype) {
    const ref = RAMLUtil.getTypeRef(itype);

    if (!this.typesProcessed[ref]) {
      this.typesQueue.push(itype);
      this.typesProcessed[ref] = true;
    }

    return ref;
  }

  /**
   * Mark a particular error constant as used.
   *
   * This approach is used as an optimisation in order to reduce the total
   * number of error messages included for smaller output size, when some
   * of them are not used.
   *
   * @param {String} errorConstant - The error constant
   */
  useError(errorConstant) {
    if (this.usedErrors.indexOf(errorConstant) !== -1) {
      return;
    }

    this.usedErrors.push(errorConstant);
  }

  /**
   * Shift the next type in the type queue
   *
   * @returns {ITypeDefinition|undefined} The next item on queue or undefined if empty
   */
  nextTypeInQueue() {
    return this.typesQueue.shift();
  }

  /**
   * Create a constant string in the string table and return a code reference
   * to it
   *
   * @param {String} tableName - The name of the table to put a string into
   * @param {String} name - The name of the string
   * @param {String} value - The value of the string
   * @returns {String} The code reference to the table entry
   */
  getConstantString(tableName, name, value) {
    if (this.constantTables[tableName] == null) {
      this.constantTables[tableName] = {};
    }

    if (this.constantTables[tableName][name] == null) {
      this.constantTables[tableName][name] = JSON.stringify(value);
    }

    // Return constant name
    return `context.${tableName}.${name}`;
  }

  /**
   * Create a constant expression and get a code reference to it
   *
   * @param {String} tableName - The name of the table to put a string into
   * @param {String} expression - The constant expression
   * @returns {String} The code reference to the table entry
   */
  getConstantExpression(tableName, expression) {
    if (this.constantTables[tableName] == null) {
      this.constantTables[tableName] = [];
    }

    let index = this.constantTables[tableName].indexOf(expression);
    if (index === -1) {
      index = this.constantTables[tableName].length;
      this.constantTables[tableName].push(expression);
    }

    return `context.${tableName}[${index}]`;
  }

}

module.exports = GeneratorContext;
