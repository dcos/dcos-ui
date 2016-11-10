module.exports = {

  /**
   * Simple fragment factory that tests the given expression and if it fails,
   * it creates a new RAMLError instance with the error message from the
   * constant specified. If that constant is using templates, you can use the
   * errorMessageVariables to pass values for these variables.
   *
   * @param {String} testExpr - The javascript test expression
   * @param {String} errorConstant - The error constant from the ERROR_MESSAGES global table
   * @param {Object} [errorMessageVariables] - Optional values for the error message templates
   *
   * @returns {String} Returns the contents of the javascript fragment
   */
  testAndPushError(testExpr, errorConstant, errorMessageVariables={}) {
    let variablesExpr = JSON.stringify(errorMessageVariables);

    return [
      `if (${testExpr}) {`,
        `\terrors.push(new RAMLError(path, ${errorConstant}, ${variablesExpr}));`,
      '}'
    ];
  }

};
