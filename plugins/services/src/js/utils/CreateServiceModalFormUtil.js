import ValidatorUtil from "#SRC/js/utils/ValidatorUtil";
import ErrorMessageUtil from "#SRC/js/utils/ErrorMessageUtil";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

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
   * Maps errors to the tabs they're coming from
   *
   * @param {Array} errors - an array of all errors
   * @param {Object} tabPathRegexes - an object where keys map to the service form tabs,
   * and the values are an array of regexes to test error paths against
   * @param {Array} pathTranslationRules - The path translation rules
   * @param {object} i18n - lingui internationalization instance object
   * @returns {Object} An object where where keys map to the service form tabs,
   * and the values are an array of objects containing error data
   */
  getTopLevelTabErrors(errors, tabPathRegexes, pathTranslationRules, i18n) {
    const errorPaths = errors.map(error => error.path.join("."));

    return errorPaths.reduce((errorsByTabObj, pathString) => {
      Object.keys(tabPathRegexes).forEach(tabId => {
        const errorMessage = ErrorMessageUtil.getUnanchoredErrorMessage(
          errors[errorPaths.indexOf(pathString)],
          pathTranslationRules,
          i18n
        );

        if (!errorsByTabObj[tabId]) {
          errorsByTabObj[tabId] = [];
        }

        if (
          tabPathRegexes[tabId].some(rule => rule.test(pathString)) &&
          !errorsByTabObj[tabId].some(
            error => error.parsedMessage === errorMessage
          )
        ) {
          errorsByTabObj[tabId].push({
            parsedMessage: errorMessage,
            errorObj: errors[errorPaths.indexOf(pathString)]
          });
        }
      });

      return errorsByTabObj;
    }, {});
  },

  /**
   * Maps container errors to the container tabs they're coming from
   *
   * @param {Object} errors - An object where where keys map to the service form tabs,
   * and the values are an array of objects containing error data
   * @returns {Object} An object where where keys map to the container tabs,
   * and the values are an array of objects containing error data
   */
  getContainerTabErrors(errors) {
    const containerErrors = errors.containers || [];

    return containerErrors.reduce((containerErrorObj, error) => {
      const contErrorPath = findNestedPropertyInObject(error, "errorObj.path");
      const containerId = `container${contErrorPath[1]}`;
      if (!containerErrorObj[containerId]) {
        containerErrorObj[containerId] = [];
      }
      containerErrorObj[containerId].push(error);

      return containerErrorObj;
    }, {});
  }
};

module.exports = CreateServiceModalFormUtil;
