import ValidatorUtil from '../../../../../src/js/utils/ValidatorUtil';

const MarathonErrorUtil = {

  /**
   * Try to guess an error type from it's contents
   *
   * @param {String} message - The marathon error string
   * @returns {String} Returns the message type
   */
  /* eslint-disable no-unused-vars */
  getErrorType(message) {
  /* eslint-enable no-unused-vars */

    // TODO: This will be implemented on the next PR
    return 'MARATHON_ERROR';

  },

  /**
   * Parses errros from the given input format into the common error format
   * used internally
   *
   * For reference, marathon responds an error according to the exception that
   * occurred and it's translated with the following checks:
   *
   * https://github.com/mesosphere/marathon/blob/master/src/main/scala/mesosphere/marathon/api/MarathonExceptionMapper.scala#L63
   *
   * @param {Object|String} error - The marathon error(s) to process
   * @returns {Array} Returns an array of error objects
   */
  parseErrors(error) {
    if (error == null) {
      return [];
    }

    // `error` could be a string, if the error has no details
    if (typeof error === 'string') {
      return [
        {
          path: [],
          message: error,
          type: MarathonErrorUtil.getErrorType(error),
          variables: {}
        }
      ];
    }

    // `details` can be missing
    if (!error.details) {
      if (!error.message) {
        return [];
      }

      return [
        {
          path: [],
          message: error.message,
          type: MarathonErrorUtil.getErrorType(error.message),
          variables: {}
        }
      ];
    }

    // `details` can be a string
    if (typeof error.details === 'string') {
      return [
        {
          path: [],
          message: error.details,
          type: MarathonErrorUtil.getErrorType(error.details),
          variables: {}
        }
      ];

    }

    // `details` can be an array of errors
    return error.details.reduce(function (memo, {errors, path}) {

      // Convert marathon path components to a dot-separated string
      // and then split it into an array
      //
      // A marathon path looks like: /container(0)/containerPath
      //
      const pathString = path
        .replace(/\//g, '.')
        .replace(/\((\d+)\)/g, (_, id) => `.${id}`)
        .slice(1);

      // Don't create array with empty first item when we have an empty path
      let pathComponents = [];
      if (pathString !== '') {
        pathComponents = pathString
          .split('.')
          .map(function (component) {
            if (ValidatorUtil.isNumber(component)) {
              return Number(component);
            }

            return component;
          });
      }

      // For every error, create the correct message
      return errors.reduce(function (memo, errorMessage) {
        memo.push({
          path: pathComponents,
          message: errorMessage,
          type: MarathonErrorUtil.getErrorType(errorMessage),
          variables: {}
        });

        return memo;
      }, memo);
    }, []);
  }

};

module.exports = MarathonErrorUtil;
