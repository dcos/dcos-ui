import { indentFragments } from '../utils/GeneratorUtil';
import RAMLUtil from '../utils/RAMLUtil';

const NATIVE_TYPE_VALIDATORS = {

  /**
   * Any
   *
   * @param {Array} fragments - The validator fragment code lines so far
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The type validator code lines
   */
  /* eslint-disable no-unused-vars */
  any(fragments, context) {
  /* eslint-enable no-unused-vars */
    // Everything passes
    return [];
  },

  /**
   * Nil
   *
   * @param {Array} fragments - The validator fragment code lines so far
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The type validator code lines
   */
  nil(fragments, context) {
    context.useError('TYPE_NOT_NULL');

    return [].concat(
      'if (value !== null) {',
        '\terrors.push(new RAMLError(path, context, "TYPE_NOT_NULL"));',
      '} else {',
        indentFragments( fragments ),
      '}'
    );
  },

  /**
   * Number type
   *
   * @param {Array} fragments - The validator fragment code lines so far
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The type validator code lines
   */
  NumberType(fragments, context) {
    context.useError('TYPE_NOT_NUMBER');

    return [].concat(
      'if (isNaN(value)) {',
        '\terrors.push(new RAMLError(path, context, "TYPE_NOT_NUMBER"));',
      '} else {',
        indentFragments( fragments ),
      '}'
    );
  },

  /**
   * Integer type
   *
   * @param {Array} fragments - The validator fragment code lines so far
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The type validator code lines
   */
  IntegerType(fragments, context) {
    context.useError('TYPE_NOT_INTEGER');

    return [].concat(
      'if (isNaN(value) || (value % 1 !== 0)) {',
        '\terrors.push(new RAMLError(path, context, "TYPE_NOT_INTEGER"));',
      '} else {',
        indentFragments( fragments ),
      '}'
    );
  },

  /**
   * Boolean type
   *
   * @param {Array} fragments - The validator fragment code lines so far
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The type validator code lines
   */
  BooleanType(fragments, context) {
    context.useError('TYPE_NOT_BOOLEAN');

    return [].concat(
      'if ((value !== false) && (value !== true)) {',
        '\terrors.push(new RAMLError(path, context, "TYPE_NOT_BOOLEAN"));',
      '} else {',
        indentFragments( fragments ),
      '}'
    );
  },

  /**
   * String type
   *
   * @param {Array} fragments - The validator fragment code lines so far
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The type validator code lines
   */
  StringType(fragments, context) {
    context.useError('TYPE_NOT_STRING');

    return [].concat(
      'if (typeof value != "string") {',
        '\terrors.push(new RAMLError(path, context, "TYPE_NOT_STRING"));',
      '} else {',
        indentFragments( fragments ),
      '}'
    );
  },

  /**
   * Date/Time type
   *
   * @param {Array} fragments - The validator fragment code lines so far
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The type validator code lines
   */
  DateTimeType(fragments, context) {
    context.useError('TYPE_NOT_DATETIME');

    return [].concat(
      'if (isNaN(new Date(value).getTime())) {',
        '\terrors.push(new RAMLError(path, context, "TYPE_NOT_DATETIME"));',
      '} else {',
        indentFragments( fragments ),
      '}'
    );
  },

  /**
   * Object type
   *
   * @param {Array} fragments - The validator fragment code lines so far
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The type validator code lines
   */
  object(fragments, context) {
    context.useError('TYPE_NOT_OBJECT');

    return [].concat(
      'if ((typeof value != "object") || (value === null)) {',
        '\terrors.push(new RAMLError(path, context, "TYPE_NOT_OBJECT"));',
      '} else {',
        indentFragments( fragments ),
      '}'
    );
  },

  /**
   * Array type
   *
   * @param {Array} fragments - The validator fragment code lines so far
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The type validator code lines
   */
  array(fragments, context) {
    context.useError('TYPE_NOT_ARRAY');

    return [].concat(
      'if (!Array.isArray(value)) {',
        '\terrors.push(new RAMLError(path, context, "TYPE_NOT_ARRAY"));',
      '} else {',
        indentFragments( fragments ),
      '}'
    );
  },

  /**
   * Union type
   *
   * @param {Array} fragments - The validator fragment code lines so far
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The type validator code lines
   */
  /* eslint-disable no-unused-vars */
  union(fragments, context) {
  /* eslint-enable no-unused-vars */
    return fragments;
  }

};

module.exports = {

  /**
   * Wrap a set of fragments in a condition only if the value passes the native
   * type test.
   *
   * @param {Array} fragments - The validator fragment code lines so far
   * @param {ITypeDefinition} itype - The RAML type to create validation for
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The type validator code lines
   */
  wrapWithNativeTypeValidator(fragments, itype, context) {
    const typeName = RAMLUtil.getBuiltinTypeName(itype);
    if (NATIVE_TYPE_VALIDATORS[typeName] === undefined) {
      throw TypeError(`Unknown native type ${typeName}`);
    }

    return NATIVE_TYPE_VALIDATORS[typeName](fragments, context);
  }

};
