import {deepCopy} from './Util';

const TEMPLATE_VAR_REGEXP = /\{([^\}]+)}/g;

const ErrorMessagesUtil = {

  /**
   * Create an `errorMessage` table that can be passed to `RAMLValidator.clone`
   * in order to provide custom error messages to RAML validator.
   *
   * @param {Object} config - The pre-processed error messages
   * @returns {Object} Returns the errorMessages object
   */
  errorMessagesFromConfig(config) {
    return Object.keys(config).reduce(function (memo, errorConstant) {
      const errorMessageTests = config[errorConstant];

      // Create a function override for the RAML validator
      // NOTE: We are creating a clojure for ensuring the correct
      memo[errorConstant] = (function (errorMessageTests) {
        return function (templateVars, path) {
          const match = errorMessageTests.find(function (item) {
            return item.regexp.exec(path.join('.'));
          });

          // We must never reach this case. If we did, we were not
          // careful default when we populated the errors or the overrides
          if (!match) {
            if (process.env.NODE_ENV !== 'production') {
              throw new TypeError(`No patch matched for error constant ${errorConstant}`);
            }

            return '';
          }

          // Replace tempalte variables in the error message
          return match.message.replace(TEMPLATE_VAR_REGEXP, function (match) {
            return String(templateVars[match.slice(1, -1)] || '');
          });
        };
      })(errorMessageTests);

      return memo;
    }, {});
  },

  /**
   * This function extends a previously created error definition using
   * `create` or `extends`, with the additional definitions given.
   *
   * @param {Object} messages - The error message configuration
   * @param {Object} base - The base pre-processed error messages to extend
   * @returns {Object} Returns the new pre-processed error messages
   */
  extend(messages, base) {
    const newMessages = ErrorMessagesUtil.create(messages);
    const baseClone = deepCopy(base);

    return Object.keys(newMessages).reduce(function (memo, errorConstant) {
      if (memo[errorConstant] == null) {
        memo[errorConstant] = [];
      }

      // Prepend new tests in order for the base tests to be called afterwards
      memo[errorConstant] = newMessages[errorConstant]
        .concat(memo[errorConstant]);

      return memo;
    }, baseClone);
  },

  /**
   * Create a pre-processed error lookup table
   *
   * This function effectively transposes the 2D input table, by creating an
   * object with error constants as keys, and an array of path matchers as
   * values.
   *
   * @example <caption>Syntax of messages</caption>
   * const Errors = ErrorMessagesUtil.createErrorMessages({
   *    'some\.key\.regex': {
   *      SOME_CONSTANT: 'Some error message in this constant'
   *    }
   *  })
   * @param {Object} messages - The error message configuration
   * @returns {Object} Returns the pre-processed error messages
   */
  create(messages) {
    return Object.keys(messages).reduce(function (memo, keyRegexStr) {
      const keyRegex = new RegExp(keyRegexStr);
      const pathMessages = messages[keyRegexStr];

      return Object.keys(pathMessages).reduce(function (memo, errorConstant) {
        if (memo[errorConstant] == null) {
          memo[errorConstant] = [];
        }

        // Keep track of error translation on this constant
        memo[errorConstant].push({
          regexp: keyRegex,
          message: pathMessages[errorConstant]
        });

        return memo;
      }, memo);
    }, {});
  }

};

module.exports = ErrorMessagesUtil;
