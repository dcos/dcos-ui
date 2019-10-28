import SearchDSL from "./grammar/SearchDSL";

/**
 * This is a high-level compnent that wraps
 */
export default class DSLExpression {
  /**
   * Construct an immutable DSL expression
   *
   * @param {String} value - The expression string
   */
  constructor(value = "") {
    let ast = null;
    const cleanValue = value.trim();
    let filter = (filters, resultset) => resultset;
    let hasErrors = false;

    if (cleanValue !== "") {
      // Try to parse the expression
      try {
        const result = SearchDSL.parse(cleanValue);
        if (result.ast && result.filter) {
          ast = result.ast;
          filter = result.filter;
        }
      } catch (e) {
        hasErrors = true;
      }
    }

    // Define properties
    Object.defineProperties(this, {
      ast: {
        value: ast,
        writable: false,
        enumerable: true
      },
      defined: {
        value: Boolean(value),
        writable: false,
        enumerable: true
      },
      filter: {
        value: filter,
        writable: false,
        enumerable: true
      },
      hasErrors: {
        value: hasErrors,
        writable: false,
        enumerable: true
      },
      value: {
        value,
        writable: false,
        enumerable: true
      }
    });
  }
}
