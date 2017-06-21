import ValidatorUtil from "../../../../../src/js/utils/ValidatorUtil";

const CreateServiceModalFormUtil = {
  /**
   * Remove empty properties from the given input object, or pass through the
   * value if it is a non-object.
   *
   * @param {*} object - The object to process (any other value passes through)
   * @returns {*} A shallow copy of the object, with the non-empty values
   */
  stripEmptyProperties(object) {
    if (typeof object !== "object" || object === null) {
      return object;
    }

    // Pick base object according to type
    let baseObject = {};
    if (Array.isArray(object)) {
      baseObject = [];
    }

    return Object.keys(object).reduce(function(memo, key) {
      if (
        (!ValidatorUtil.isEmpty(object[key]) && !Number.isNaN(object[key])) ||
        Array.isArray(object[key])
      ) {
        // Apply the strip function recursively and keep only non-empty values
        const value = CreateServiceModalFormUtil.stripEmptyProperties(
          object[key]
        );
        if (
          (!ValidatorUtil.isEmpty(value) && !Number.isNaN(value)) ||
          Array.isArray(value)
        ) {
          memo[key] = value;
        }
      }

      return memo;
    }, baseObject);
  },

  /**
   * Patch an object with an object
   *
   * This function:
   * - Removes items whose patch value is `empty` (null, undefined or '')
   * - Keeps `empty` values whose source value is also `empty`
   * - Uses the `applyPatch` function recursively to patch each property
   *
   * @param {Object} data - The source data to patch
   * @param {Object} patch - The patch to apply on the data
   * @returns {Object} Returns the patched data response
   */
  applyPatchObject(data, patch) {
    const newObj = Object.assign({}, data);

    return Object.keys(patch).reduce(function(memo, key) {
      const dataValue = memo[key];
      const patchValue = patch[key];

      // If the patch value becomes empty, we should remove the item from
      // the data object, but only if it does not already have an empty value
      if (ValidatorUtil.isEmpty(patchValue) || Number.isNaN(patchValue)) {
        if (!ValidatorUtil.isEmpty(dataValue) && !Number.isNaN(dataValue)) {
          delete memo[key];

          return memo;
        }
      }

      const value = CreateServiceModalFormUtil.applyPatch(
        dataValue,
        patchValue
      );

      // Repeat the same check like before, since the patched structure
      // might have been emptied
      if (ValidatorUtil.isEmpty(value) || Number.isNaN(value)) {
        if (ValidatorUtil.isEmpty(dataValue) || Number.isNaN(dataValue)) {
          return memo;
        }

        delete memo[key];

        return memo;
      }

      memo[key] = value;

      return memo;
    }, newObj);
  },

  /**
   * Patch an array with an array
   *
   * This function:
   * - Removes array items whose value is `empty` (null, undefined, or '')
   * - Keeps `empty` items whose source value is also `empty`
   * - Uses the `applyPatch` function recursively to patch each item
   *
   * @param {Array} data - The source data to patch
   * @param {Array} patch - The patch to apply on the data
   * @returns {Array} Returns the patched data response
   */
  applyPatchArray(data, patch) {
    const itemCount = Math.max(data.length, patch.length);
    const result = [];

    for (let i = 0; i < itemCount; ++i) {
      const dataValue = data[i];
      const patchValue = patch[i];

      // If we have exhausted patching entries and we are now
      // adding new ones, process them in priority.
      if (i >= data.length) {
        if (!ValidatorUtil.isEmpty(patchValue) && !Number.isNaN(patchValue)) {
          const value = CreateServiceModalFormUtil.stripEmptyProperties(
            patchValue
          );

          if (!ValidatorUtil.isEmpty(value) && !Number.isNaN(value)) {
            result.push(value);
          }
        }

        /* eslint-disable no-continue */
        continue;
        /* eslint-enable no-continue */
      }

      // If the patch value becomes empty, we should remove the item from
      // the array. Effectively, this means that we should not push the item
      // in the next step and therefore we must continue the loop;
      if (ValidatorUtil.isEmpty(patchValue) || Number.isNaN(patchValue)) {
        if (!ValidatorUtil.isEmpty(dataValue) && !Number.isNaN(dataValue)) {
          /* eslint-disable no-continue */
          continue;
          /* eslint-enable no-continue */
        }
      }

      // Arrays allow type replacement in the patch function
      const value = CreateServiceModalFormUtil.applyPatch(
        dataValue,
        patchValue,
        true
      );

      // Push value only if the value is not empty
      if (ValidatorUtil.isEmpty(value) || Number.isNaN(value)) {
        if (!ValidatorUtil.isEmpty(dataValue) && !Number.isNaN(dataValue)) {
          /* eslint-disable no-continue */
          continue;
          /* eslint-enable no-continue */
        }
      }

      result.push(value);
    }

    return result;
  },

  /**
   * Apply patch data on the given source data, following the principles:
   *
   * 1. An "empty" value in the patch removes the field.
   *
   * 2. The previous statement is not applied when the respective `data` field
   *    already contains an "empty" value. In that case, the "empty" data value
   *    is preserved.
   *
   * 3. If both `data` and `patch` have a value in a field, but with different
   *    types, the value from `data` is preferred.
   *
   * @param {Object} data - The source data to patch
   * @param {Object} patch - The patch to apply with
   * @param {Boolean} allowTypeChange - Set to true to allow types to change
   * @returns {Object} The patched data response
   */
  applyPatch(data, patch, allowTypeChange = false) {
    // If we don't have data, prefer patch, but make sure not to include
    // empty properties in the objects
    if (data == null) {
      return CreateServiceModalFormUtil.stripEmptyProperties(patch);
    }

    // Prefer `data` type if we have a type clash
    if (
      typeof data !== typeof patch ||
      Array.isArray(data) !== Array.isArray(patch)
    ) {
      return allowTypeChange ? patch : data;
    }

    // Non-object types just pass through
    if (typeof patch !== "object" || patch === null) {
      return patch;
    }

    if (Array.isArray(data)) {
      return CreateServiceModalFormUtil.applyPatchArray(data, patch);
    }

    return CreateServiceModalFormUtil.applyPatchObject(data, patch);
  }
};

module.exports = CreateServiceModalFormUtil;
