const MESSAGE_VARIABLE = /\\{\\{([^\\}]+)\\}\\}/g;

const ErrorMessageUtil = {

  /**
   * Translate the error messages in the `errors` array, using the translation
   * rules in the `translationRules` array.
   *
   * @param {Array} errors - The list of errors to translate
   * @param {Array} translationRules - The translation rules to use
   * @returns {Array} Returns a new list with the translated error messages
   */
  translateErrorMessages(errors, translationRules) {
    return errors.map(function (error) {
      const {path, type, variables} = error;
      const pathString = path.join('.');

      const rule = translationRules.find(function (rule) {
        return (rule.type === type) && rule.path.exec(pathString);
      });

      // If there is no translation rule, pass-through the message
      if (rule == null) {
        return error;
      }

      // Return the translated message
      return {
        message: rule.message.replace(MESSAGE_VARIABLE, function (match) {
          return ''+variables[match.slice(2, -2)] || '';
        }),
        path,
        type,
        variables
      };
    });
  }

};

module.exports = ErrorMessageUtil;
