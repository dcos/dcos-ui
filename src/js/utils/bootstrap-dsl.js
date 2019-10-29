import { DSLParserUtil, DSLCombinerTypes } from "@d2iq/dsl-filter";

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

DSLParserUtil.setFactories(combineFunctionFactory, filterFunctionFactory);
