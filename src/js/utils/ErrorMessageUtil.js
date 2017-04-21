const MESSAGE_VARIABLE = /\{\{([^{}]+)\}\}/g;

const ErrorMessageUtil = {
  /**
   * This function returns the `message` of the given array object,
   * with the path and message components concatenated into a uniform
   * string that can be displayed unanchored.
   *
   * @param {Object} error - The error message
   * @param {Array} pathTranslationRules - The path translation rules
   * @returns {String} Returns the composed error string
   */
  getUnanchoredErrorMessage(error, pathTranslationRules) {
    const { message, path = [] } = error;
    const pathString = path.join(".");
    const rule = pathTranslationRules.find(function(rule) {
      return rule.match.exec(pathString);
    });

    if (!rule && !pathString) {
      return message;
    }
    if (!rule) {
      return `${pathString}: ${message}`;
    }

    // We need to make the first letter of the error message lowercase
    // in order to compose a proper sentence with the resolved path name.
    const errorMessage = message[0].toLowerCase() + message.substr(1);

    return `${rule.name} ${errorMessage}`;
  },

  /**
   * Translate the error messages in the `errors` array, using the translation
   * rules in the `translationRules` array.
   *
   * @param {Array} errors - The list of errors to translate
   * @param {Array} translationRules - The translation rules to use
   * @returns {Array} Returns a new list with the translated error messages
   */
  translateErrorMessages(errors, translationRules) {
    return errors.map(function(error) {
      const { path = [], type, variables } = error;
      const pathString = path.join(".");

      const rule = translationRules.find(function(rule) {
        return rule.type === type && rule.path.exec(pathString);
      });

      // If there is no translation rule, pass-through the message
      if (rule == null) {
        return error;
      }

      // Return the translated message
      return {
        message: rule.message.replace(MESSAGE_VARIABLE, function(
          match,
          variable
        ) {
          return "" + variables[variable] || "";
        }),
        path,
        type,
        variables
      };
    });
  }
};

module.exports = ErrorMessageUtil;
