import Objektiv from "objektiv";

/**
 * Convert an object path to a lens
 *
 * @param {Array} path - The array of the path components
 * @param {function} [strategy] - The strategy to chose for missing elements
 * @return {Objectiv.lens} Returns the lens to address the path
 */
function path2lens(path, strategy = Objektiv.resolve.tryhard) {
  return path.reduce((parent, segment) => {
    if (isNaN(segment)) {
      return parent.then(Objektiv.makeAttrLens(segment, strategy));
    }
    return parent.then(Objektiv.makeAtLens(segment, strategy));
  }, Objektiv.identity);
}

const DataValidatorUtil = {
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

    return validatorFn.reduce(
      (errors, validator) => errors.concat(validator(inputData)),
      []
    );
  },

  /**
   * This function converts an array of errors returned from `validate`
   * and creates an object with the errors in the correct location.
   *
   * @param {[{path, message}]} errors - The array of errors
   * @returns {Object} Returns an object with the errors in the correct paths
   */
  errorArrayToMap(errors) {
    return errors.reduce((errorMap, error) => {
      // We cannot place root errors in the map
      if (error.path.length === 0) {
        return errorMap;
      }

      const lens = path2lens(error.path);
      let message = error.message;
      const prevMessage = lens.get(errorMap);

      if (prevMessage) {
        message = `${prevMessage}, ${message}`;
      }

      return lens.set(errorMap, message);
    }, {});
  }
};

export default DataValidatorUtil;
