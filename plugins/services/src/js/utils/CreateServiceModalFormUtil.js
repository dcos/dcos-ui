import ValidatorUtil from '../../../../../src/js/utils/ValidatorUtil';

const CreateServiceModalFormUtil = {
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
    // If we don't have data, prefer patch
    if (data == null) {
      return patch;
    }

    // Prefer `data` type if we have a type clash
    if (typeof data !== typeof patch) {
      return data;
    }

    // Non-object types just pass through
    if (typeof patch !== 'object') {
      return patch;
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

      memo[key] = CreateServiceModalFormUtil.applyPatch(memo[key], patch[key]);

      return memo;
    }, Object.assign({}, data));
  }
};

module.exports = CreateServiceModalFormUtil;
