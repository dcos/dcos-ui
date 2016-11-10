import FragmentFactory from '../utils/FragmentFactory';
import { indentFragments } from '../utils/GeneratorUtil';
import RAMLUtil from '../utils/RAMLUtil';

const NATIVE_TYPE_VALIDATORS = {

  /**
   * Any
   */
  any: function(fragments, context) {
    // Everything passes
    return [];
  },

  /**
   * Nil
   */
  nil: function(fragments, context) {
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'TYPE_NOT_NULL', 'Expecting null');

    return [].concat(
      `if (value !== null) {`,
        `\terrors.push(new RAMLError(path, ${ERROR_MESSAGE}));`,
      `} else {`,
        indentFragments( fragments ),
      `}`
    );
  },

  /**
   * Number type
   */
  NumberType: function(fragments, context) {
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'TYPE_NOT_NUMBER', 'Expecting a number');

    return [].concat(
      `if (isNaN(value)) {`,
        `\terrors.push(new RAMLError(path, ${ERROR_MESSAGE}));`,
      `} else {`,
        indentFragments( fragments ),
      `}`
    );
  },

  /**
   * Integer type
   */
  IntegerType: function(fragments, context) {
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'TYPE_NOT_INTEGER', 'Expecting an integer number');

    return [].concat(
      `if (isNaN(value) || (value % 1 !== 0)) {`,
        `\terrors.push(new RAMLError(path, ${ERROR_MESSAGE}));`,
      `} else {`,
        indentFragments( fragments ),
      `}`
    );
  },

  /**
   * Boolean type
   */
  BooleanType: function(fragments, context) {
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'TYPE_NOT_BOOLEAN', 'Expecting a boolean value');

    return [].concat(
      `if ((value !== false) && (value !== true)) {`,
        `\terrors.push(new RAMLError(path, ${ERROR_MESSAGE}));`,
      `} else {`,
        indentFragments( fragments ),
      `}`
    );
  },

  /**
   * String type
   */
  StringType: function(fragments, context) {
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'TYPE_NOT_STRING', 'Expecting a string');

    return [].concat(
      `if (typeof value != "string") {`,
        `\terrors.push(new RAMLError(path, ${ERROR_MESSAGE}));`,
      `} else {`,
        indentFragments( fragments ),
      `}`
    );
  },

  /**
   * Date/Time type
   */
  DateTimeType: function(fragments, context) {
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'TYPE_NOT_DATETIME', 'Expecting a date/time string');

    return [].concat(
      `if (isNaN(new Date(value).getTime())) {`,
        `\terrors.push(new RAMLError(path, ${ERROR_MESSAGE}));`,
      `} else {`,
        indentFragments( fragments ),
      `}`
    );
  },

  /**
   * Object type
   */
  object: function(fragments, context) {
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'TYPE_NOT_OBJECT', 'Expecting an object');

    return [].concat(
      `if (typeof value != "object") {`,
        `\terrors.push(new RAMLError(path, ${ERROR_MESSAGE}));`,
      `} else {`,
        indentFragments( fragments ),
      `}`
    );
  },

  /**
   * Array type
   */
  array: function(fragments, context) {
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'TYPE_NOT_ARRAY', 'Expecting an array');

    return [].concat(
      `if (!Array.isArray(value)) {`,
        `\terrors.push(new RAMLError(path, ${ERROR_MESSAGE}));`,
      `} else {`,
        indentFragments( fragments ),
      `}`
    );
  },

  /**
   * Union type
   */
  union: function(fragments, context) {
    return fragments;
  }

}

module.exports = {

  /**
   * Wrap a set of fragments in a condition only if the value passes the native
   * type test.
   */
  wrapWithNativeTypeValidator(fragments, itype, context) {
    let typeName = RAMLUtil.getBuiltinTypeName(itype);
    if (NATIVE_TYPE_VALIDATORS[typeName] === undefined) {
      throw TypeError(`Unknown native type ${typeName}`);
    }

    return NATIVE_TYPE_VALIDATORS[typeName](fragments, context);
  }

};
