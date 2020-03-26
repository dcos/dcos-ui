import { ErrorPathMapping, ErrorTypes, FormError } from "./FormErrorUtil";

interface PathTranslationRules {
  path: RegExp;
  type: ErrorTypes;
  message: string;
}

const MESSAGE_VARIABLE = /\|\|([^|]+)\|\|/g;

const ErrorMessageUtil = {
  /**
   * This function returns the `message` of the given array object,
   * with the path and message components concatenated into a uniform
   * string that can be displayed unanchored.
   *
   * @param {Object} error - The error message
   * @param {Array} pathTranslationRules - The path translation rules
   * @param {object} i18n - lingui internationalization instance object
   * @returns {String} Returns the composed error string
   */
  getUnanchoredErrorMessage(
    error: FormError,
    pathTranslationRules: ErrorPathMapping[],
    i18n: any = null
  ) {
    const { message, path = [] } = error;
    const pathString = path.join(".");
    const rule = pathTranslationRules.find((rule: ErrorPathMapping) => {
      return Boolean(rule.match && rule.match.exec(pathString));
    });

    if (error.isUnanchored) {
      return message;
    }
    if (!rule && !pathString) {
      return message;
    }
    if (!rule) {
      return `${pathString}: ${message}`;
    }

    // We need to make the first letter of the error message lowercase
    // in order to compose a proper sentence with the resolved path name.
    const errorMessage = message[0].toLowerCase() + message.substr(1);

    let name = rule.name;
    if (i18n) {
      name = i18n._(name);
    }

    return `${name} ${errorMessage}`;
  },

  /**
   * Translate the error messages in the `errors` array, using the translation
   * rules in the `translationRules` array.
   *
   * @param {Array} errors - The list of errors to translate
   * @param {Array} translationRules - The translation rules to use
   * @param {object} i18n - lingui internationalization instance object
   * @returns {Array} Returns a new list with the translated error messages
   */
  translateErrorMessages(
    errors: FormError[],
    translationRules: PathTranslationRules[],
    i18n: any = null
  ): FormError[] {
    return errors.map((error) => {
      const { path = [], type, variables } = error;
      const pathString = path.join(".");

      const rule = translationRules.find((rule) => {
        if (rule.path && rule.type === type) {
          return Boolean(rule.path.exec(pathString));
        }
        return false;
      });

      // If there is no translation rule, pass-through the message
      if (rule == null) {
        return error;
      }

      let message = rule.message;
      if (i18n) {
        message = i18n._(message);
      }

      // Return the translated message
      return {
        message: message
          ? message.replace(MESSAGE_VARIABLE, (_match, variable) => {
              if (variables) {
                return "" + variables[variable];
              }
              return "";
            })
          : "",
        path,
        type,
        variables,
      };
    });
  },
};

export default ErrorMessageUtil;
