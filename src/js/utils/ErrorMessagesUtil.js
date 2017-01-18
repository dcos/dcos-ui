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
    const typeGroups = config.reduce(function (memo, item) {
      if (memo[item.type] == null) {
        memo[item.type] = [];
      }

      memo[item.type].push(item);

      return memo;
    }, {});

    return Object.keys(typeGroups).reduce(function (memo, errorType) {
      const typeErrorMessages = typeGroups[errorType];

      // Create a function override for the RAML validator
      // NOTE: We are creating a clojure for ensuring the correct
      memo[errorType] = function (templateVars, path) {
        const pathStr = path.join('.');
        const match = typeErrorMessages.find(function (item) {
          return item.path.exec(pathStr) &&
            (item.type === errorType);
        });

        // We must never reach this case. If we did, we were not
        // careful default when we populated the errors or the overrides
        if (!match) {
          if (process.env.NODE_ENV !== 'production') {
            throw new TypeError(`No patch matched for error type ${errorType}`);
          }

          return '';
        }

        // Replace template variables in the error message
        return match.message.replace(TEMPLATE_VAR_REGEXP, function (match) {
          const value = templateVars[match.slice(1, -1)];
          if (value === undefined) {
            return '';
          }

          return String(value);
        });
      };

      return memo;
    }, {});
  }

};

module.exports = ErrorMessagesUtil;
