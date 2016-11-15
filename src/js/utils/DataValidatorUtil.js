import Objektiv from 'objektiv';

/**
 * Convert an object path to a lens
 *
 * @param {Array} path - The array of the path components
 * @param {function} [strategy] - The trategy to chose for missing elements
 * @return {Objectiv.lens} Returns the lens to adress the path
 */
function path2lens(path, strategy=Objektiv.resolve.tryhard) {
  return path.reduce(function (parent, segment) {
    if (isNaN(segment)) {
      return parent.then(Objektiv.makeAttrLens(segment, strategy));
    } else {
      return parent.then(Objektiv.makeAtLens(segment, strategy));
    }
  }, Objektiv.full);
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
      let lens = path2lens(error.path);
      let message = error.message;
      let prevMessage = lens.get(errorMap);

      if (prevMessage) {
        message = `${prevMessage}, ${message}`;
      }

      return lens.set(errorMap, message);
    }, {});
  },

  /**
   * Update only the specified path on the errors map
   *
   * @param {Object} errors - The current state of the errors object
   * @param {Object} newErrors - The new state of the errors object
   * @param {Array} path - The path to keep
   * @returns {Object} Returns the old errors with only the path updated from the new errors
   */
  updateOnlyMapPath(errors, newErrors, path) {
    let lens = path2lens(path);

    return lens.set(errors, lens.get(newErrors));
  },

  /**
   * Reset the errors only on the given path
   *
   * @param {Object} errors - The current state of the errors object
   * @param {Array} path - The path to reset
   * @returns {Object} Returns the errors, with the path missing
   */
  resetOnlyMapPath(errors, path) {
    return path2lens(path).set(errors, undefined);
  }

};
