import ErrorMessageUtil from "#SRC/js/utils/ErrorMessageUtil";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

export enum ErrorTypes {
  PROP_IS_MISSING = "PROP_IS_MISSING",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  STRING_PATTERN = "STRING_PATTERN",
  GENERIC = "GENERIC",
  SERVICE_DEPLOYING = "SERVICE_DEPLOYING",
  ITEMS_MIN = "ITEMS_MIN",
}

export interface FormError {
  isPermissive?: boolean;
  isUnanchored?: boolean;
  message: string;
  path: string[];
  type?: ErrorTypes;
  variables?: { [key: string]: string };
}

export interface ErrorPathMapping {
  name: string;
  match: RegExp;
}

interface ErrorData {
  parsedMessage?: string;
  errorObj?: FormError;
}

type ErrorsByTab = { [key: string]: ErrorData[] };

const FormUtil = {
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
  getTopLevelTabErrors(
    errors: FormError[],
    tabPathRegexes: { [key: string]: RegExp[] },
    pathTranslationRules: ErrorPathMapping[],
    i18n: any
  ) {
    const errorPaths = errors.map((error) => error.path.join("."));

    return errorPaths.reduce(
      (errorsByTabObj: ErrorsByTab, pathString: string) => {
        Object.keys(tabPathRegexes).forEach((tabId) => {
          const errorMessage = ErrorMessageUtil.getUnanchoredErrorMessage(
            errors[errorPaths.indexOf(pathString)],
            pathTranslationRules,
            i18n
          );

          if (!errorsByTabObj[tabId]) {
            errorsByTabObj[tabId] = [];
          }

          if (
            tabPathRegexes[tabId].some((rule: RegExp) =>
              rule.test(pathString)
            ) &&
            !errorsByTabObj[tabId].some(
              (error: ErrorData) => error.parsedMessage === errorMessage
            )
          ) {
            errorsByTabObj[tabId].push({
              parsedMessage: errorMessage,
              errorObj: errors[errorPaths.indexOf(pathString)],
            });
          }
        });

        return errorsByTabObj;
      },
      {}
    );
  },

  /**
   * Maps container errors to the container tabs they're coming from
   *
   * @param {Object} errors - An object where where keys map to the service form tabs,
   * and the values are an array of objects containing error data
   * @returns {Object} An object where where keys map to the container tabs,
   * and the values are an array of objects containing error data
   */
  getContainerTabErrors(errors: ErrorsByTab) {
    const containerErrors: ErrorData[] = errors.containers || [];

    return containerErrors.reduce(
      (containerErrorObj: ErrorsByTab, error: ErrorData) => {
        const contErrorPath = findNestedPropertyInObject(
          error,
          "errorObj.path"
        );
        const containerId = `container${contErrorPath[1]}`;
        if (!containerErrorObj[containerId]) {
          containerErrorObj[containerId] = [];
        }
        containerErrorObj[containerId].push(error);

        return containerErrorObj;
      },
      {}
    );
  },
};

export default FormUtil;
