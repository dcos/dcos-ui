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

var DataValidatorUtil = {

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

  updateOnlyOnPath(oldList, newList, path) {
    let pathStr = path.join('.');
    let newErrors = newList.filter(function (error) {
      return error.path.join('.') === pathStr;
    });

    // Check if there is nothing to add
    if (newErrors.length === 0) {
      return oldList;
    }

    // Strip old errors and append new errors
    return DataValidatorUtil.stripErrorsOnPath(oldList, path)
      .concat(newErrors);
  },

  stripErrorsOnPath(errorList, path) {
    let pathStr = path.join('.');
    return errorList.filter(function (error) {
      return error.path.join('.') !== pathStr;
    });
  }

};

module.exports = DataValidatorUtil;
