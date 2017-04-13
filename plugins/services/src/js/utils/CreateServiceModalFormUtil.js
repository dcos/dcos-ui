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
      if (!ValidatorUtil.isEmpty(object[key]) && !Number.isNaN(object[key])) {
        // Apply the strip function recursively and keep only non-empty values
        const value = CreateServiceModalFormUtil.stripEmptyProperties(object[key]);
        if (!ValidatorUtil.isEmpty(value) && !Number.isNaN(value)) {
          memo[key] = value;
        }
      }

      return memo;
    }, baseObject);
  }
};

module.exports = CreateServiceModalFormUtil;
