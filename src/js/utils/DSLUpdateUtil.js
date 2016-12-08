import Config from '../config/Config';
import DSLCombinerTypes from '../constants/DSLCombinerTypes';
import DSLExpression from '../structs/DSLExpression';
import DSLFilterTypes from '../constants/DSLFilterTypes';
import DSLUtil from './DSLUtil';
import {FilterNode} from '../structs/DSLASTNodes';

const DSLUpdateUtil = {

  /**
   * Update the text representation of a node in order to match the new node.
   *
   * @param {String} src - The source expression string
   * @param {ASTNode} node - The ast node to replace
   * @param {ASTNode} newNode - The ast node to replace with
   * @param {number} offset - The offset to apply on position indices
   * @returns {String} Returns the updated string
   */
  updateNodeTextString(src, node, newNode, offset=0) {
    const {position, filterType} = node;
    let textStart = position[0][0] + offset;
    let textEnd = position[0][1] + offset;
    let {filterParams: {text}} = newNode;

    if (filterType !== newNode.filterType) {
      if (Config.environment === 'development') {
        throw new Error('Trying to update a node with a mismatching node!');
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
  },

  /**
   * Update the label of an attribute node with the new label from `newNode`.
   *
   * @param {String} src - The source expression string
   * @param {ASTNode} node - The ast node to replace
   * @param {ASTNode} newNode - The ast node to replace with
   * @param {number} offset - The offset to apply on position indices
   * @returns {String} Returns the updated string
   */
  updateNodeValueString(src, node, newNode, offset=0) {
    const {position, filterType} = node;
    const labelStart = position[0][0] + offset;
    const labelEnd = position[0][1] + offset;
    let {filterParams: {label}} = newNode;

    if (filterType !== newNode.filterType) {
      if (Config.environment === 'development') {
        throw new Error('Trying to update a node with a mismatching node!');
      }

      return src;
    }

    if (filterType !== DSLFilterTypes.ATTRIB) {
      if (Config.environment === 'development') {
        throw new Error('Trying to update a non-label node as label!');
      }

      return src;
    }

    // Replace only label
    return src.substr(0, labelStart) + `${label}:` + src.substr(labelEnd);
  },

  /**
   * Delete the string representation of the given expression string
   *
   * @param {String} src - The source expression string
   * @param {ASTNode} node - The node node to replace
   * @param {number} offset - The offset to apply on position indices
   * @param {Boolean} [bleed] - Set to true if you want to trim bleeding spaces
   * @returns {String} Returns the updated string
   */
  deleteNodeString(src, node, offset=0) {
    const {position} = node;
    let endingRegex = /^(\s|,\s|$)/;
    let start = position[0][0] + offset;
    let end = position[0][1] + offset;

    // Attributes have a special handling, in case they are multi-valued
    if (node.filterType === DSLFilterTypes.ATTRIB) {
      // Change scope to value
      start = position[1][0] + offset;
      end = position[1][1] + offset;

      // Increase the scope to the entire value only if the node is the only
      // value in the attrib. To test for this, we are checking if the character
      // right before is the label ':' and the character after is a whitespace
      // or a comma with whitespace
      if ((src[start - 1] === ':') && (endingRegex.exec(src.substr(end)))) {
        start = position[0][0] + offset;
        end = position[1][1] + offset;

      // Otherwise, bleed left to remove the comma if we are part of multi-value
      } else if (src[start - 1] === ',') {
        start -= 1;

      // Or bleed right if we were the first item
      } else if (src[end] === ',') {
        end += 1;
      }
    }

    // Bleed left whitespace, if exists, or right whitespace
    // if we are the first token
    if (src[start - 1] === ' ') {
      start -= 1;
    } else if ((start === 0) && (src[end] === ' ')) {
      end += 1;
    }

    // Bleed left one more time if we have a lingering tailing ','
    if ((src[start - 1] === ',') && (end >= src.length)) {
      start -= 1;
    }

    // Return the striped result
    return src.substr(0, start) + src.substr(end);
  },

  /**
   * Append the given node at the end of the expression
   *
   * @param {String} src - The source expression string
   * @param {ASTNode} node - The node node to replace
   * @param {ASTNode} fullAst - The representation of the current full AST
   * @param {number} offset - The offset to apply on position indices
   * @param {DSLCombinerTypes} [combiner] - The combiner operation to use
   * @returns {String} Returns the updated string
   */
  addNodeString(src, node, fullAst, offset=0, combiner=DSLCombinerTypes.AND) {
    const whitespaceRegex = /\s+$/;

    // Trim tailing whitespace
    src = src.replace(whitespaceRegex, '');

    // If we are using AND operation just append node string with whitespace
    if (combiner === DSLCombinerTypes.AND) {
      if (src) {
        src += ' ';
      }

      return src + DSLUtil.getNodeString(node);
    }

    // If we are using OR operator things are tricky only with attributes
    // The rest are just appended at the end, but with comma separator.
    if (node.filterType !== DSLFilterTypes.ATTRIB) {
      if (src) {
        src += ', ';
      }

      return src + DSLUtil.getNodeString(node);
    }

    // On attributes with OR operator we first check if we already have an
    // attribute with such label and we prefer creating multi-value expression
    const attribNodes = DSLUtil.reduceAstFilters(fullAst, (memo, filter) => {
      if (filter.filterParams.label === node.filterParams.label) {
        memo.push(filter);
      }

      return memo;
    }, []);

    // If there is no other attribute with this label, fallback
    // in the regular appending approach
    if (attribNodes.length === 0) {
      if (src) {
        src += ', ';
      }

      return src + DSLUtil.getNodeString(node);
    }

    // Append an attribute to the last label
    const appendToNode = attribNodes[0];

    // Inject only the text into the given label
    return src.substr(0, appendToNode.position[1][1] + offset) + ',' +
      node.filterParams.text + src.substr(appendToNode.position[1][1] + offset);
  },

  /**
   * Append the given nodes at the end of the expression
   *
   * @param {DSLExpression} expression - The expression to update
   * @param {Array} nodes - The node(s) to append
   * @param {DSLCombinerTypes} [newCombiner] - The combiner for first node
   * @param {DSLCombinerTypes} [itemCombiner] - The combiner beteen nodes
   * @returns {DSLExpression} expression - The updated expression
   */
  applyAdd(expression, nodes, newCombiner=DSLCombinerTypes.AND,
    itemCombiner=DSLCombinerTypes.AND) {

    let expressionUpdate = nodes.reduce(({value, offset}, node, index) => {
      let combiner = itemCombiner;

      // If this is the first element, check if we don't have an existing
      // element in the AST and if not, use the `newCombiner` instead of the
      // `itemCombiner`
      if (index === 0) {
        const filter = DSLUpdateUtil.getFilterForNode(node);
        const matchingNodes = DSLUtil.findNodesByFilter(expression.ast, filter);

        if (matchingNodes.length === 0) {
          combiner = newCombiner;
        }
      }

      // Apply addition of new item
      let newValue = DSLUpdateUtil.addNodeString(
        value, node, expression.ast, offset, combiner
      );

      // Update offset in order for the token positions in the expression
      // AST to be processable even after the updates
      offset += newValue.length - value.length;

      return {offset, value: newValue};
    }, {offset: 0, value: expression.value});

    return new DSLExpression(expressionUpdate.value);
  },

  /**
   * Delete the given list of nodes from the expression
   *
   * @param {DSLExpression} expression - The expression to update
   * @param {Array} nodes - The node(s) to delete
   * @returns {DSLExpression} expression - The updated expression
   */
  applyDelete(expression, nodes) {
    let newExpression = nodes.reduce(({value, offset}, node) => {
      // Delte value
      const newValue = DSLUpdateUtil.deleteNodeString(
        value, node, offset
      );

      // This action shifted the location of the tokens in the original
      // expression. Update offset.
      offset += newValue.length - value.length;

      return {value: newValue, offset};
    }, {value: expression.value, offset: 0});

    return new DSLExpression(newExpression.value);
  },

  /**
   * Replace the given nodes in the expression with the new array of nodes
   * taking correcting actions if the lengths do not match.
   *
   * @param {DSLExpression} expression - The expression to update
   * @param {Array} nodes - The node(s) to update
   * @param {Array} newNodes - The node(s) to update with
   * @param {DSLCombinerTypes} [newCombiner] - The combiner for first node
   * @param {DSLCombinerTypes} [itemCombiner] - The combiner beteen nodes
   * @returns {DSLExpression} expression - The updated expression
   */
  applyReplace(expression, nodes, newNodes, newCombiner=DSLCombinerTypes.AND,
    itemCombiner=DSLCombinerTypes.AND) {

    const updateCount = Math.min(nodes.length, newNodes.length);
    let expressionValue = expression.value;
    let offset = 0;

    // First update nodes
    for (let i = 0; i < updateCount; ++i) {
      const updateNode = nodes[i];
      const withNode = newNodes[i];

      // Update expression value
      const newValue = DSLUpdateUtil.updateNodeTextString(
        expressionValue, updateNode, withNode, offset
      );

      // This action may have shifted the location of the tokens
      // in the original expression. Update offset.
      offset += newValue.length - expressionValue.length;

      expressionValue = newValue;
    }

    // Comile the status of the expression so far
    const newExpression = new DSLExpression(expressionValue);

    // Delete nodes using applyDelete
    if (newNodes.length < nodes.length) {

      // Note that the offsets in the `nodes` array point to the old expression
      // so they have to be updated in order to match the new expression
      const deleteNodes = nodes.slice(updateCount)
        .map((node) => {
          node.position = node.position.map(([start, end]) => {
            return [
              start + offset,
              end + offset
            ];
          });

          return node;
        });

      // We avoid expanding the logic of `applyDelete` and instead we use the
      // 'hack' of the offset update above in order to isolate the logic.
      return DSLUpdateUtil.applyDelete(
        newExpression, deleteNodes
      );
    }

    // Add nodes using applyAdd
    if (newNodes.length > nodes.length) {
      return DSLUpdateUtil.applyAdd(
        newExpression, newNodes.slice(updateCount), newCombiner, itemCombiner
      );
    }

    // Otherwise just return the expression
    return newExpression;
  },

  /**
   * This function gets an AST node and converts it into a virtual node, useful
   * for searching similar nodes in the AST using `DSLUtil.findNodesByFilter`
   *
   * @param {FilterNode} node - The AST node to abstract
   * @returns {FilterNode} Returns the virtual node for this node
   */
  getFilterForNode(node) {
    let keepParams = Object.assign({}, node.filterParams);

    // Delete label text from attribute nodes to make them generic
    if (node.filterType === DSLFilterTypes.ATTRIB) {
      delete keepParams.text;
    }

    // Return a virtual node
    return new FilterNode(
      0, 0, node.filterType, keepParams
    );
  }

};

module.exports = DSLUpdateUtil;
