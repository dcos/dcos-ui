import { CombinerNode, FilterNode } from "./DSLASTNodes";
import DSLFilterTypes from "./DSLFilterTypes";

const ENDING_WHITESPACE = /\s+$/;

/**
 * Checks if the given expression can be processed by the UI
 *
 * @param {DSLExpression} expression - The expression to process
 * @returns {Boolean} Returns the expression state
 */
export function canFormProcessExpression(expression) {
  const hasGroups = expression.value.indexOf("(") !== -1;
  const repeatingStatus = reduceAstFilters(
    expression.ast,
    (memo, filter) => {
      if (memo.isRepeating) {
        return memo;
      }

      // Ignore fuzzy tokens
      if (filter.filterType === DSLFilterTypes.FUZZY) {
        return memo;
      }

      // Keep track of the tokens we have found so far
      const filterStr = getNodeString(filter);
      if (memo.found[filterStr] == null) {
        memo.found[filterStr] = true;

        return memo;
      }

      // If we found a repeating token, mark repeating
      memo.isRepeating = true;

      return memo;
    },
    { isRepeating: false, found: {} }
  );

  // We can process an expression only if we have no groups if we
  // have groups and no repeating nodes
  return !hasGroups || !repeatingStatus.isRepeating;
}

/**
 * This function checks if the given partFilters can create clean results
 * with the given AST structure as input.
 *
 * @param {DSLExpression} expression - The parsed expression
 * @param {Array} partFilters - An array of `FilterNode` to use for match ref.
 * @returns {Boolean} Returns true if the expression can be handled by the UI
 */
export function canProcessParts(expression, partFilters) {
  const propNames = Object.keys(partFilters);

  return propNames.every(prop => {
    const matchAgainst = partFilters[prop];
    const matchingNodes = findNodesByFilter(expression.ast, matchAgainst);

    // NOTE: Be aware that the entire form should be disabled if the
    //       expression is difficult for the UI to process. This means
    //       that if we have a grouping operator and at least one repeating
    //       node, this code shouldn't be executed at all.
    //       You can use `canFormProcessExpression` for this.

    switch (matchAgainst.filterType) {
      // Attrib nodes can only handle 1 match
      case DSLFilterTypes.ATTRIB:
        return matchingNodes.length <= 1;
      // Exact nodes can only handle 1 match
      case DSLFilterTypes.EXACT:
        return matchingNodes.length <= 1;
      // We are concatenating all fuzzy-matching nodes into a string
      // so we have no problem if we have more than one.
      case DSLFilterTypes.FUZZY:
        return true;
    }
  });
}

/**
 * This function walks the given AST and extracts all the nodes matching the
 * given filter node.
 *
 * @param {ASTNode} ast - The AST node to walk on
 * @param {FilterNode} filter - The reference AST node to compare against
 * @returns {Array} Returns an array of FilterNodes tha match filter
 */
export function findNodesByFilter(ast, filter) {
  return reduceAstFilters(
    ast,
    (memo, astFilter) => {
      const { filterParams, filterType } = astFilter;
      const {
        filterParams: compareFilterParams,
        filterType: compareFilterType
      } = filter;

      // Require types to match
      if (filterType !== compareFilterType) {
        return memo;
      }

      // Require only testing properties to match
      const compareParamNames = Object.keys(compareFilterParams);
      const comparePropMatches = compareParamNames.every(prop => {
        return filterParams[prop] === compareFilterParams[prop];
      });

      if (compareParamNames.length === 0 || comparePropMatches) {
        return memo.concat(astFilter);
      }

      return memo;
    },
    []
  );
}

/**
 * Get the string representation of the given AST node
 *
 * @param {ASTNode} node - The DSL AST Node
 * @returns {String} The string representation of the node
 */
export function getNodeString(node) {
  const { filterParams, filterType } = node;
  switch (filterType) {
    case DSLFilterTypes.ATTRIB:
      return `${filterParams.label}:${filterParams.text}`;

    case DSLFilterTypes.EXACT:
      return `"${filterParams.text}"`;

    case DSLFilterTypes.FUZZY:
      return filterParams.text;
  }
}

/**
 * This function returns an object with the values for all the given
 * partFilters by analyzing the ast given as input.
 *
 * @param {DSLExpression} expression - The parsed expression
 * @param {Array} partFilters - An array of `FilterNode` to use for match ref.
 * @returns {Object} Returns an object with the propType keys and their values
 */
export function getPartValues(expression, partFilters) {
  const propNames = Object.keys(partFilters);

  // NOTE: We assume that `canProcessParts` is called before and this
  //       function is called only after a positive answer. Therefore we are
  //       safe to do some unsafe assumptions for this.

  return propNames.reduce((memo, prop) => {
    const matchAgainst = partFilters[prop];
    const matchingNodes = findNodesByFilter(expression.ast, matchAgainst);

    switch (matchAgainst.filterType) {
      //
      // Properties created through attribute filter will get a boolean value
      //
      case DSLFilterTypes.ATTRIB:
        memo[prop] = matchingNodes.length === 1;

        return memo;
      //
      // Properties created through exact filter will get a string value
      //
      case DSLFilterTypes.EXACT:
        if (matchingNodes.length === 0) {
          memo[prop] = null;

          return memo;
        }

        memo[prop] = matchingNodes[0].filterParams.text;

        return memo;
      //
      // Properties created through fuzzy filter will get a string value,
      // composed by joining together any individual item in the string
      //
      case DSLFilterTypes.FUZZY:
        if (matchingNodes.length === 0) {
          memo[prop] = null;

          return memo;
        }

        memo[prop] = matchingNodes.map(ast => ast.filterParams.text).join(" ");

        // Also append whatever whitespace remains at the end of the raw value
        //
        // NOTE: This is a trick to allow dynamic updates of a React component
        //       since white spaces at the end of the expression are not part
        //       of a regular DSL expression and are trimmed.
        //
        const tailingWhitespace = ENDING_WHITESPACE.exec(expression.value);
        if (tailingWhitespace) {
          memo[prop] += tailingWhitespace[0];
        }

        return memo;
    }
  }, {});
}

/**
 * This function walks the provided ast tree and calls back the given
 * callback function in the same way the `Array.reduce` function works.
 *
 * @param {ASTNode} ast - The AST node to walk on
 * @param {function} callback - The function to call for every filter
 * @param {any} memo - The AST node to walk on
 * @returns {any} Returns the result of the reduce operation
 */
export function reduceAstFilters(ast, callback, memo) {
  if (!ast) {
    return memo;
  }

  // Collect terminal nodes
  if (ast instanceof FilterNode) {
    return callback(memo, ast);
  }

  // Traverse children of combiner nodes
  if (ast instanceof CombinerNode) {
    return ast.children.reduce((curMemo, child) => {
      return reduceAstFilters(child, callback, curMemo);
    }, memo);
  }

  return memo;
}
