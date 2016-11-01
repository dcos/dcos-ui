import DSLFilterTypes from '../constants/DSLFilterTypes';
import DSLCombinerTypes from '../constants/DSLCombinerTypes';
import {FilterNode, CombinerNode} from '../structs/DSLASTNodes';

/**
 * Template function for combining two filters, used by the parser
 *
 * When this function is 'instantiated', the first two arguments are bound by
 * the parser to the child filter functions (see below) and the `this` context
 * to an instance of a `CombinerNode` representing the token AST node.
 *
 * When this function is used, the user has to supply the final two arguments.
 * The `filters` object is a library with the available filters that can be used
 * in this context, while the `resultset` is an instance of `List` or `Tree` on
 * which the filers have to be applied.
 *
 * @private
 * @this CombinerNode
 *
 * @param {function} [filter1] - The first child filter function (auto-bound)
 * @param {function} [filter2] - The second child filter function (auto-bound)
 * @param {Object} filters - An object containing the valid filters that can be used
 * @param {List} resultset - An instance of List or Tree containing the items to filter
 *
 * @returns {List} - Returns the filtered resultset
 */
function combineTemplateFn(filter1, filter2, filters, resultset) {
  let intermediateResultset;

  switch (this.combinerType) {
    case DSLCombinerTypes.AND:
      // We are interested in the intersection of the results of the two filters
      intermediateResultset = filter1(filters, resultset);
      return filter2(filters, intermediateResultset);
      break;

    case DSLCombinerTypes.OR:
      // We are interested in the union of the results of the two filters

      // TODO: Merge the results of `filter1(filters, resultset)` and
      //       `filter2(filters, resultset)`.

      // TODO: Implement a `List.merge` function that merges two lists,
      //       discarding duplicate values.

      return resultset;
      break;
  }
}

/**
 * Template function for filtering a resultset, used by the parser
 *
 * When this function is 'instantiated' by the parser, `this` context
 * is bound to an instance of a `FilterNode` representing the token AST node.
 *
 * When this function is used, the user has to supply the final two arguments.
 * The `filters` object is a library with the available filters that can be used
 * in this context, while the `resultset` is an instance of `List` or `Tree` on
 * which the filers have to be applied.
 *
 * @private
 * @this FilterNode
 *
 * @param {Object} filters - An object containing the valid filters that can be used
 * @param {List} resultset - An instance of List or Tree containing the items to filter
 *
 * @returns {List} - Returns the filtered resultset
 */
function filterTemplateFn(filters, resultset) {

  // TODO: Lookup in `filters` object one or more valid filters that can be
  //       applied on the bound token. We can use the `this.filterType` and
  //       `this.filterParams` for this purpose. Then apply them on the
  //       resultset, keeping only the matched results.

  return resultset;
}

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
        filter: combineTemplateFn.bind(ast, f1.filter, f2.filter),
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
        filter: combineTemplateFn.bind(ast, f1.filter, f2.filter),
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
    attrib(label, text, lstart, lend, vstart, vend) {
      let ast = new FilterNode(lstart, lend, DSLFilterTypes.ATTRIB, {text, label});
      ast.position.push([vstart, vend]);

      return {
        filter: filterTemplateFn.bind(ast),
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
        filter: filterTemplateFn.bind(ast),
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
        filter: filterTemplateFn.bind(ast),
        ast
      };
    }

  }

};
