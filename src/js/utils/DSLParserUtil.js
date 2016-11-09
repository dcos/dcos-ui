import DSLFilterTypes from '../constants/DSLFilterTypes';
import DSLCombinerTypes from '../constants/DSLCombinerTypes';
import {FilterNode, CombinerNode} from '../structs/DSLASTNodes';

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
 * For example, when the expression: `string AND attrib:value` is encountered,
 * two run-time filter functions will be produced by the `filterFunctionFactory`
 * function (see below), and combined into one, using this function.
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
      return function (filters, resultset) {
        // We are interested in the intersection of the results of the two filters
        let intermediateResultset = leftFilterFn(filters, resultset);
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
      return function (filters, resultset) {
        // We are interested in the union of the results of the two filters

        // TODO: Merge the results of `leftFilterFn(filters, resultset)` and
        //       `rightFilterFn(filters, resultset)`.

        // TODO: Implement a `List.merge` function that merges two lists,
        //       discarding duplicate values.

        return resultset;
      };
  };
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
/* eslint-disable no-unused-vars */
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
  return function (filters, resultset) {

    // TODO: Lookup in `filters` object one or more valid filters that can be
    //       applied on the bound token. We can use the `this.filterType` and
    //       `this.filterParams` for this purpose. Then apply them on the
    //       resultset, keeping only the matched results.

    return resultset;
  };
};
/* eslint-enable no-unused-vars */

/**
 * The following functions are used by the JISON parser in order to parse
 * the expression into a properly nested set of functions and AST nodes.
 *
 * @name DSLParserUtil
 */
module.exports = {

  /**
   * Namespace for the merge operator
   *
   * @namesapce
   */
  Merge: {

    /**
     * Combines two filter functions using the AND operator
     *
     * @param {Function} f1 - The first operation function
     * @param {Function} f2 - The second operation function
     *
     * @returns {Function} Returns a combined filter function
     */
    and(f1, f2) {
      let ast = new CombinerNode(DSLCombinerTypes.AND, f1.ast, f2.ast);

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
      let ast = new CombinerNode(DSLCombinerTypes.OR, f1.ast, f2.ast);

      return {
        filter: combineFunctionFactory(ast, f1.filter, f2.filter),
        ast
      };
    }

  },

  /**
   * Operator namespace
   *
   * @namesapce
   */
  Operator: {

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
      let ast = new FilterNode(lstart, lend, DSLFilterTypes.ATTRIB, {text, label});
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
      let ast = new FilterNode(start, end, DSLFilterTypes.EXACT, {text});

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
      let ast = new FilterNode(start, end, DSLFilterTypes.FUZZY, {text});

      return {
        filter: filterFunctionFactory(ast),
        ast
      };
    }

  }

};
