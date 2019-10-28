import DSLCombinerTypes from "./DSLCombinerTypes";
import DSLExpression from "./DSLExpression";
import DSLFilterTypes from "./DSLFilterTypes";
import * as DSLUtil from "./DSLUtil";

const STRING_EXPR = /(['"])[^\1]+?(?=\1)\1/;
const Config = {
  environment: "production"
};

/**
 * Default function used by the `applyAdd` function to detect is similar node
 * already exists in the expression.
 *
 * @param {FilterNode} referenceNode - The node to compare against
 * @param {FilterNode} compareNode - The node to compare
 * @returns {Boolean} Returns `true` if there is no similar node in the AST
 */
export function defaultNodeCompareFunction(referenceNode, compareNode) {
  if (referenceNode.filterType !== compareNode.filterType) {
    return false;
  }

  if (referenceNode.filterType !== DSLFilterTypes.ATTRIB) {
    return true;
  }

  return referenceNode.filterParams.label === compareNode.filterParams.label;
}

/**
 * Clean-up a DSL expression without damaging it's semantic meaning.
 * This function does the following:
 *
 * - Expands single parenthesis (ex. "foo (bar) baz")
 * - Trims consecutive whitespaces (ex "foo  bar ")
 * - Trims consecutive or empty commas (ex. "foo,, bar, , baz")
 * - Removes orphan comas (ex. ", foo (, bar) label:,baz")
 *
 * @param {String} src - The source expression string
 * @returns {String} The cleaned-up expression string
 */
export function cleanupExpressionString(src) {
  const strings = [];

  // Extract string expressions so we have a simpler expression to work with
  src = src.replace(STRING_EXPR, match => {
    strings.push(match);

    return "\x01";
  });

  // Perform clean-ups
  src = src.replace(/\(([^ ,]+)\)/g, "$1"); // Single parenthesis
  src = src.replace(/\s+/g, " "); // Consecutive spaces
  src = src.replace(/,(\s*,)+/g, ","); // Consecutive commas
  src = src.replace(/^\s*,/g, ""); // Orphan commas (left-side)
  src = src.replace(/,\s*$/g, ""); // Orphan commas (right-side)
  src = src.replace(/\(\s*,\s*/g, "("); // Orphan commas (left-paren)
  src = src.replace(/\s*,\s*\)/g, ")"); // Orphan commas (right-paren)
  src = src.replace(/:,+/g, ":"); // Orphan commas (multi-value)
  src = src.replace(/\s+,\s+/g, ", "); // Commas with surrounding whitespace

  // Put strings back
  /* eslint-disable no-control-regex */
  src = src.replace(/\x01/g, () => {
    return strings.pop(0);
  });
  /* eslint-enable no-control-regex */

  return src.trim();
}

/**
 * Update the text representation of a node in order to match the new node.
 *
 * @param {String} src - The source expression string
 * @param {ASTNode} node - The ast node to replace
 * @param {ASTNode} newNode - The ast node to replace with
 * @param {number} offset - The offset to apply on position indices
 * @returns {String} Returns the updated string
 */
export function updateNodeTextString(src, node, newNode, offset = 0) {
  const { position, filterType } = node;
  let textStart = position[0][0] + offset;
  let textEnd = position[0][1] + offset;
  let {
    filterParams: { text }
  } = newNode;

  if (filterType !== newNode.filterType) {
    if (Config.environment === "development") {
      throw new Error("Trying to update a node with a mismatching node!");
    }

    return src;
  }

  // Attributes have their value on position[1]
  if (filterType === DSLFilterTypes.ATTRIB) {
    textStart = position[1][0] + offset;
    textEnd = position[1][1] + offset;
  }

  // Exact matches are not quoted, so quote them now
  if (filterType === DSLFilterTypes.EXACT) {
    text = `"${text}"`;
  }

  // Replace the entire string
  return src.substr(0, textStart) + text + src.substr(textEnd);
}

/**
 * Update the label of an attribute node with the new label from `newNode`.
 *
 * @param {String} src - The source expression string
 * @param {ASTNode} node - The ast node to replace
 * @param {ASTNode} newNode - The ast node to replace with
 * @param {number} offset - The offset to apply on position indices
 * @returns {String} Returns the updated string
 */
export function updateNodeValueString(src, node, newNode, offset = 0) {
  const { position, filterType } = node;
  const labelStart = position[0][0] + offset;
  const labelEnd = position[0][1] + offset;
  const {
    filterParams: { label }
  } = newNode;

  if (filterType !== newNode.filterType) {
    if (Config.environment === "development") {
      throw new Error("Trying to update a node with a mismatching node!");
    }

    return src;
  }

  if (filterType !== DSLFilterTypes.ATTRIB) {
    if (Config.environment === "development") {
      throw new Error("Trying to update a non-label node as label!");
    }

    return src;
  }

  // Replace only label
  return src.substr(0, labelStart) + `${label}:` + src.substr(labelEnd);
}

/**
 * Delete the string representation of the given expression string
 *
 * @param {String} src - The source expression string
 * @param {ASTNode} node - The node node to replace
 * @param {number} offset - The offset to apply on position indices
 * @param {Boolean} [bleed] - Set to true if you want to trim bleeding spaces
 * @returns {String} Returns the updated string
 */
export function deleteNodeString(src, node, offset = 0) {
  const { position } = node;
  const endingRegex = /^(\s|,\s|$)/;
  let start = position[0][0] + offset;
  let end = position[0][1] + offset;

  // Attributes have a special handling, in case they are multi-valued
  if (node.filterType === DSLFilterTypes.ATTRIB) {
    // Change scope to value
    start = position[1][0] + offset;
    end = position[1][1] + offset;

    // Increase the scope to the entire value only if the node is the only
    // value in the attribute. To test for this, we are checking if the
    // character right before is the label ':' and the character after is a
    // whitespace or a comma with whitespace
    if (src[start - 1] === ":" && endingRegex.exec(src.substr(end))) {
      start = position[0][0] + offset;
      end = position[1][1] + offset;

      // Otherwise, bleed left to remove the comma if we are part of multi-value
    } else if (src[start - 1] === ",") {
      start -= 1;

      // Or bleed right if we were the first item
    } else if (src[end] === ",") {
      end += 1;
    }
  }

  // Strip and cleanup any damage caused by it
  return cleanupExpressionString(src.substr(0, start) + src.substr(end));
}

/**
 * Append the given node at the end of the expression
 *
 * @param {String} src - The source expression string
 * @param {ASTNode} node - The node node to add
 * @param {ASTNode} fullAst - The representation of the current full AST
 * @param {number} offset - The offset to apply on position indices
 * @param {DSLCombinerTypes} [combiner] - The combiner operation to use
 * @returns {String} Returns the updated string
 */
export function addNodeString(
  src,
  node,
  fullAst,
  offset = 0,
  combiner = DSLCombinerTypes.AND
) {
  const whitespaceRegex = /\s+$/;

  // Trim tailing whitespace
  src = src.replace(whitespaceRegex, "");

  // If we are using AND operation just append node string with whitespace
  if (combiner === DSLCombinerTypes.AND) {
    if (src) {
      src += " ";
    }

    return src + DSLUtil.getNodeString(node);
  }

  // If we are using OR operator, just append
  if (src) {
    src += ", ";
  }

  return src + DSLUtil.getNodeString(node);
}

/**
 * Append the given node at the end of the given attribute node, creating
 * or updating a multi-value node
 *
 * @param {String} src - The source expression string
 * @param {ASTNode} node - The node node to append
 * @param {ASTNode} toNode - The attribute node to add onto
 * @param {number} offset - The offset to apply on position indices
 * @returns {String} Returns the updated string
 */
export function appendAttribNodeString(src, node, toNode, offset = 0) {
  // Inject only the text into the given label
  return (
    src.substr(0, toNode.position[1][1] + offset) +
    "," +
    node.filterParams.text +
    src.substr(toNode.position[1][1] + offset)
  );
}

/**
 * Append the given nodes at the end of the expression
 *
 * @param {DSLExpression} expression - The expression to update
 * @param {Array} nodes - The node(s) to append
 * @param {Object} [options] - Combine options
 * @returns {DSLExpression} expression - The updated expression
 */
export function applyAdd(expression, nodes, options = {}) {
  const {
    nodeCompareFunction = defaultNodeCompareFunction,
    itemCombiner = DSLCombinerTypes.AND,
    newCombiner = DSLCombinerTypes.AND
  } = options;

  const expressionUpdate = nodes.reduce(
    ({ value, offset }, node, index) => {
      let combiner = itemCombiner;
      let newValue = value;

      // Find all the existing nodes, related to the node being added
      const relevantNodes = DSLUtil.reduceAstFilters(
        expression.ast,
        (memo, filterNode) => {
          if (nodeCompareFunction(node, filterNode)) {
            memo.push(filterNode);
          }

          return memo;
        },
        []
      );

      // If this is the first element, check if we have previous relevant
      // occurrences in the expression, and if yes, use the `newCombiner`
      if (index === 0) {
        if (relevantNodes.length === 0) {
          combiner = newCombiner;
        }
      }

      // In case of an OR operator + attribute node we take special care for
      // creating multi-value attributes when possible
      if (
        combiner === DSLCombinerTypes.OR &&
        node.filterType === DSLFilterTypes.ATTRIB &&
        relevantNodes.length !== 0 &&
        node.filterParams.label === relevantNodes[0].filterParams.label
      ) {
        newValue = appendAttribNodeString(
          value,
          node,
          relevantNodes[0],
          offset
        );

        // Otherwise we use regular node concatenation
      } else {
        newValue = addNodeString(value, node, expression.ast, offset, combiner);
      }

      // Update offset in order for the token positions in the expression
      // AST to be processable even after the updates
      offset += newValue.length - value.length;

      return { offset, value: newValue };
    },
    { offset: 0, value: expression.value }
  );

  return new DSLExpression(expressionUpdate.value);
}

/**
 * Delete the given list of nodes from the expression
 *
 * @param {DSLExpression} expression - The expression to update
 * @param {Array} nodes - The node(s) to delete
 * @returns {DSLExpression} expression - The updated expression
 */
export function applyDelete(expression, nodes) {
  const newExpression = nodes.reduce(
    ({ value, offset }, node) => {
      // Delete value
      const newValue = deleteNodeString(value, node, offset);

      // This action shifted the location of the tokens in the original
      // expression. Update offset.
      offset += newValue.length - value.length;

      return { value: newValue, offset };
    },
    { value: expression.value, offset: 0 }
  );

  return new DSLExpression(newExpression.value);
}

/**
 * Replace the given nodes in the expression with the new array of nodes
 * taking correcting actions if the lengths do not match.
 *
 * @param {DSLExpression} expression - The expression to update
 * @param {Array} nodes - The node(s) to update
 * @param {Array} newNodes - The node(s) to update with
 * @param {Object} [addOptions] - Options for adding nodes
 * @returns {DSLExpression} expression - The updated expression
 */
export function applyReplace(expression, nodes, newNodes, addOptions = {}) {
  const updateCount = Math.min(nodes.length, newNodes.length);
  let expressionValue = expression.value;
  let offset = 0;

  // First update nodes
  for (let i = 0; i < updateCount; ++i) {
    const updateNode = nodes[i];
    const withNode = newNodes[i];

    // Update expression value
    const newValue = updateNodeTextString(
      expressionValue,
      updateNode,
      withNode,
      offset
    );

    // This action may have shifted the location of the tokens
    // in the original expression. Update offset.
    offset += newValue.length - expressionValue.length;

    expressionValue = newValue;
  }

  // Compile the status of the expression so far
  const newExpression = new DSLExpression(expressionValue);

  // Delete nodes using applyDelete
  if (newNodes.length < nodes.length) {
    // Note that the offsets in the `nodes` array point to the old expression
    // so they have to be updated in order to match the new expression
    const deleteNodes = nodes.slice(updateCount).map(node => {
      node.position = node.position.map(([start, end]) => {
        return [start + offset, end + offset];
      });

      return node;
    });

    // We avoid expanding the logic of `applyDelete` and instead we use the
    // 'hack' of the offset update above in order to isolate the logic.
    return applyDelete(newExpression, deleteNodes);
  }

  // Add nodes using applyAdd
  if (newNodes.length > nodes.length) {
    return applyAdd(newExpression, newNodes.slice(updateCount), addOptions);
  }

  // Otherwise just return the expression
  return newExpression;
}
