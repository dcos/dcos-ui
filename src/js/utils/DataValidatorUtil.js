/**
 * Return a new array or a new object, if the key given is a number or string.
 *
 * @param {String} forKey - The key to create a new object/array for
 * @returns {Object|Array} Returns an object or array, according to type
 */
function newTypeFor(forKey) {
  if (isNaN(forKey)) {
    return {};
  } else {
    return [];
  }
}

module.exports = {

  /**
   * This is a shorthand function to collect a list of validation errors for
   * the given input data, passed through an array of validation functions.
   *
   * @param {any} inputData - The data to pass to the validator(s)
   * @param {array|function} validatorFn - The validation function(s)
   * @returns {[{path, message}]} Returns an array with the errors
   */
  validate(inputData, validatorFn) {
    if (!Array.isArray(validatorFn)) {
      validatorFn = [validatorFn];
    }

    return validatorFn.reduce(function (errors, validator) {
      return errors.concat(
        validator(inputData)
      );
    }, []);
  },

  /**
   * This function converts an array of errors returned from `validate`
   * and creates an object with the errors in the correct location.
   *
   * @param {[{path, message}]} errors - The array of errors
   * @returns {Object} Returns an object with the errors in the correct paths
   */
  errorArrayToMap(errors) {
    return errors.reduce(function (errorMap, error) {
      let parent = error.path.slice(0, -1).reduce(function (object, key, i) {
        if (object[key] === undefined) {
          object[key] = newTypeFor(error.path[i+1]);
        }

        return object[key];
      }, errorMap);

      let key = error.path[error.path.length - 1];
      if (parent[key] === undefined) {
        parent[key] = error.message;
      } else {
        parent[key] += `, ${error.message}`;
      }

      return errorMap;
    }, {});
  }

};
