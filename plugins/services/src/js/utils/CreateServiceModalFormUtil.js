import ValidatorUtil from '../../../../../src/js/utils/ValidatorUtil';

const CreateServiceModalFormUtil = {

  /**
   * Remove empty properties from the given input object, or pass through the
   * value if it is a non-object.
   *
   * @param {*} object - The object to process (any other value passes through)
   * @returns {*} A shallow copy of the object, with the non-empty values
   */
  stripEmptyProperties(object) {
    if ((typeof object !== 'object') || (object === null)) {
      return object;
    }

    // Pick base object according to type
    let baseObject = {};
    if (Array.isArray(object)) {
      baseObject = [];
    }

    return Object.keys(object).reduce(function (memo, key) {
      if (!ValidatorUtil.isEmpty(object[key])) {
        // Apply the strip function recursively and keep only non-empty values
        const value = CreateServiceModalFormUtil.stripEmptyProperties(object[key]);
        if (!ValidatorUtil.isEmpty(value)) {
          memo[key] = value;
        }
      }
      return memo;
    }, baseObject);
  },

  /**
   * Apply patch data on the given source data, following the principles:
   *
   * 1. An "empty" value in the patch removes the field.
   *
   * 2. The previous statement is not applied when the respective `data` field
   *    already contains an "empty" value. In that case, the "empty" data value
   *    is perserved.
   *
   * 3. If both `data` and `patch` have a value in a field, but with different
   *    types, the value from `data` is preferred.
   *
   * @param {Object} data - The source data to patch
   * @param {Object} patch - The patch to apply with
   * @returns {Object} The patched data response
   */
  applyPatch(data, patch) {
    // If we don't have data, prefer patch, but make sure not to include
    // empty properties in the objects
    if (data == null) {
      return CreateServiceModalFormUtil.stripEmptyProperties(patch);
    }

    // Prefer `data` type if we have a type clash
    if ((typeof data !== typeof patch) ||
        (Array.isArray(data) !== Array.isArray(patch))) {
      return data;
    }

    // Non-object types just pass through
    if (typeof patch !== 'object') {
      return patch;
    }

    // Pick base object according to type
    // (Note that arrays get replaced, but objects get merged)
    let baseObject = [];
    if (!Array.isArray(data)) {
      baseObject = Object.assign({}, data);
    }

    // Walk object types
    return Object.keys(patch).reduce(function (memo, key) {

      // If the patch contains an empty value we have to remove the item,
      // with the only exception of the source value having already an empty
      // value in place.
      if (ValidatorUtil.isEmpty(patch[key])) {
        if (!ValidatorUtil.isEmpty(memo[key])) {
          delete memo[key];
        }

        return memo;
      }

      const value = CreateServiceModalFormUtil.applyPatch(memo[key], patch[key]);

      // If a field was emptied, remove it from the object, to keep structures
      // as clean as possible. (Again, only if the base value in `data` is not
      // empty)
      if (ValidatorUtil.isEmpty(value)) {
        if (ValidatorUtil.isEmpty(memo[key])) {
          return memo;
        }

        delete memo[key];

        return memo;
      }

      memo[key] = value;

      return memo;
    }, baseObject);
  }
};

module.exports = CreateServiceModalFormUtil;
