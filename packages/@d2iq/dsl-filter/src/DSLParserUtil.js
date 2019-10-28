import DSLFilterTypes from "./DSLFilterTypes";
import DSLCombinerTypes from "./DSLCombinerTypes";
import { FilterNode, CombinerNode } from "./DSLASTNodes";

/**
 * Factory for filter-combining functions (operators)
 *
 * This factory function creates the appropriate run-time function for combining
 * two other run-time filter functions based on an operator.
 *
 * By the term `run-time` we refer to a function that will be called by the user
 * in order to actually apply the filter chain on a resultset. Note that this
 * factory function will be created by the AST parser.
 *
 * For example, when the expression: `string AND attribute:value`
 * is encountered, two run-time filter functions will be produced by the
 * `filterFunctionFactory` function (see below), and combined into one,
 * using this function.
 *
 * @private
 * @param {CombineNode} ast - The AST node for the combine operator
 * @param {function} leftFilterFn - The filter function on the left side of the operator
 * @param {function} rightFilterFn - The filter function on the right side of the operator
 * @returns {function} - Returns the fabricated filter combiner
 */
function combineFunctionFactory(ast, leftFilterFn, rightFilterFn) {
  switch (ast.combinerType) {
    case DSLCombinerTypes.AND:
      /**
       * This function calculates the intersection of the resultsets of the two
       * filter functions, effectively implementing the `AND` operator.
       *
       * The `filters` object is a library with the available filters that can
       * be used in this context, while the `resultset` is an instance of `List`
       * on which the filers have to be applied.
       *
       * @param {Object} filters - An object containing the valid filters that can be used
       * @param {List} resultset - An instance of List or Tree containing the items to filter
       * @returns {List} resultset - A new instance of a List, containing the results
       */
      return function(filters, resultset) {
        // We are interested in the intersection of the results of the two filters
        const intermediateResultset = leftFilterFn(filters, resultset);

        return rightFilterFn(filters, intermediateResultset);
      };

    case DSLCombinerTypes.OR:
      /**
       * This function calculates the union of the resultsets of the two filter
       * functions, effectively implementing the `OR` operator.
       *
       * The `filters` object is a library with the available filters that can
       * be used in this context, while the `resultset` is an instance of `List`
       * on which the filers have to be applied.
       *
       * @param {Object} filters - An object containing the valid filters that can be used
       * @param {List} resultset - An instance of List or Tree containing the items to filter
       * @returns {List} resultset - A new instance of a List, containing the results
       */
      return function(filters, resultset) {
        // We are interested in the union of the results of the two filters
        const intermediateResultset = leftFilterFn(filters, resultset);

        return intermediateResultset.combine(rightFilterFn(filters, resultset));
      };
  }
}

/**
 * Factory for filter functions (operands)
 *
 * This factory function creates the appropriate run-time function that filters
 * a given resultset according to the configuration of the `ast` node provided.
 *
 * @private
 * @param {FilterNode} ast - The AST node for the filter operation
 * @returns {function} - Returns the fabricated filter function
 */
function filterFunctionFactory(ast) {
  /**
   * This function is accessible directly to the user, or combined into a chain
   * of filters using combination operators (see the `combineFunctionFactory`
   * above).
   *
   * Given an input `List` resultset, it should keep only the items that passes
   * the tests, as defined in the `ast` configuration.
   *
   * @param {Object} filters - An object containing the valid filters that can be used
   * @param {List} resultset - An instance of List or Tree containing the items to filter
   * @returns {List} resultset - A new instance of a List, containing the results
   */
  return function(filters, resultset) {
    // Apply matching filters from the filters database to the current
    // result set, and produce the new resultset.
    //
    // If more than one filters exists for the same type, the results are combined
    // using an OR operator.
    //
    // For example, if you want to test for `is:running` in a resultset that
    // contains both Nodes and Services, you could plug two different filters,
    // one that knows how to handle Nodes and one that knows how to handle
    // Services. However, since both are operating on the same `is:XXX` token
    // the will be both be applied.
    //
    return filters
      .filter(f => f.filterCanHandle(ast.filterType, ast.filterParams))
      .reduce(function(currentResultset, filter) {
        return currentResultset.combine(
          filter.filterApply(resultset, ast.filterType, ast.filterParams)
        );
      }, new resultset.constructor());
  };
}

/**
 * The following functions are used by the JISON generated code in order to parse
 * the expression into a properly nested set of functions and AST nodes.
 *
 * @name DSLParserUtil
 */

/**
 * Namespace for the merge operator
 *
 * @namespace
 */
export const Merge = {
  /**
   * Combines two filter functions using the AND operator
   *
   * @param {Function} f1 - The first operation function
   * @param {Function} f2 - The second operation function
   *
   * @returns {Function} Returns a combined filter function
   */
  and(f1, f2) {
    const ast = new CombinerNode(DSLCombinerTypes.AND, f1.ast, f2.ast);

    return {
      filter: combineFunctionFactory(ast, f1.filter, f2.filter),
      ast
    };
  },

  /**
   * Combines two filter functions using the OR operator
   *
   * @param {Function} f1 - The first operation function
   * @param {Function} f2 - The second operation function
   *
   * @returns {Function} Returns a combined filter function
   */
  or(f1, f2) {
    const ast = new CombinerNode(DSLCombinerTypes.OR, f1.ast, f2.ast);

    return {
      filter: combineFunctionFactory(ast, f1.filter, f2.filter),
      ast
    };
  }
};

/**
 * Operator namespace
 *
 * @namespace
 */
export const Operator = {
  /**
   * Return filter function for an attribute operator
   *
   * @param {String} label - The attribute label
   * @param {String} text - The attribute value
   * @param {Number} lstart - The starting position of the label token
   * @param {Number} lend - The ending position of the label token
   * @param {Number} vstart - The starting position of the value token
   * @param {Number} vend - The ending position of the value token
   *
   * @returns {Function} Returns a filter function
   */
  attribute(label, text, lstart, lend, vstart, vend) {
    const ast = new FilterNode(lstart, lend, DSLFilterTypes.ATTRIB, {
      text,
      label
    });
    ast.position.push([vstart, vend]);

    return {
      filter: filterFunctionFactory(ast),
      ast
    };
  },

  /**
   * Return a filter function for exact string matching
   *
   * @param {String} text - The fuzzy filter text input
   * @param {Number} start - The starting position of the filter token
   * @param {Number} end - The ending position of the filter token
   *
   * @returns {Function} Returns a filter function
   */
  exact(text, start, end) {
    const ast = new FilterNode(start, end, DSLFilterTypes.EXACT, { text });

    return {
      filter: filterFunctionFactory(ast),
      ast
    };
  },

  /**
   * Return a filter function for fuzzy-text matching
   *
   * @param {String} text - The fuzzy filter text input
   * @param {Number} start - The starting position of the filter token
   * @param {Number} end - The ending position of the filter token
   *
   * @returns {Function} Returns a filter function
   */
  fuzzy(text, start, end) {
    const ast = new FilterNode(start, end, DSLFilterTypes.FUZZY, { text });

    return {
      filter: filterFunctionFactory(ast),
      ast
    };
  }
};
