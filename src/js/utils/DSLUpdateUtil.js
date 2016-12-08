import Config from '../config/Config';
import DSLExpression from '../structs/DSLExpression';
import DSLFilterTypes from '../constants/DSLFilterTypes';
import DSLUtil from './DSLUtil';

const DSLUpdateUtil = {
  /**
   * Update the string representation of a node in order to match the new node
   *
   * @param {String} src - The source expression string
   * @param {ASTNode} node - The ast node to replace
   * @param {ASTNode} newNode - The ast node to replace with
   * @param {number} offset - The offset to apply on position indices
   * @returns {String} Returns the updated string
   */
  updateNodeString(src, node, newNode, offset=0) {
    const {position, filterType} = node;
    let {filterParams: {text, label}} = newNode;

    if (filterType !== newNode.filterType) {
      if (Config.environment === 'development') {
        throw new Error('Trying to update a node with a mismatching node!');
      }

      return src;
    }

    switch (filterType) {
      case DSLFilterTypes.ATTRIB:
        // Attribute nodes require a special care since their value might be
        // located in a different location than its label (ex. multi-value)
        //
        // position[0] contains the `label:` part
        // position[1] contains the `value` part
        //
        const labelStart = position[0][0] + offset;
        const labelEnd = position[0][1] + offset;
        const valueStart = position[1][0] + offset;
        const valueEnd = position[1][1] + offset;

        return src.substr(0, labelStart) + `${label}:` +
          src.substr(labelEnd, valueStart - labelEnd) + text +
          src.substr(valueEnd);

      case DSLFilterTypes.EXACT:
        // Exact matches are not quoted, so quote them now
        text = `"${text}"`;

      /* eslint-disable no-fallthrough */
      case DSLFilterTypes.FUZZY:
      /* eslint-enable no-fallthrough */

        // Exact or fuzzy matches should replace the entire text with the new
        // version of the string
        //
        // position[0] contains the `text` part
        //
        const textStart = position[0][0] + offset;
        const textEnd = position[0][1] + offset;

        return src.substr(0, textStart) + text + src.substr(textEnd);
    }
  },

  /**
   * Delete the string representation of the given AST node
   *
   * @param {String} src - The source expression string
   * @param {ASTNode} node - The node node to replace
   * @param {number} offset - The offset to apply on position indices
   * @returns {String} Returns the updated string
   */
  deleteNodeString(src, node, offset=0) {
    const {position} = node;
    let start = position[0][0] + offset;
    let end = position[position.length - 1][1] + offset;

    // Bleed left or right whitespace (but not both)
    if (src[start - 1] === ' ') {
      start -= 1;
    } else if (src[end + 1] === ' ') {
      end += 1;
    }

    // Return the striped result
    return src.substr(0, start) + src.substr(end);
  },

  /**
   * Append the given nodes at the end of the expression
   *
   * @param {DSLExpression} expression - The expression to update
   * @param {Array} nodes - The node(s) to append
   * @returns {DSLExpression} expression - The updated expression
   */
  applyAdd(expression, nodes) {
    let expressionValue = expression.value;
    const appendNodes = nodes.map((node) => {
      return DSLUtil.getNodeString(node);
    });

    // Add space only if we have an expression already
    if (expressionValue) {
      expressionValue += ' ';
    }

    // Return new expression
    return new DSLExpression(
      expressionValue + appendNodes.join(' ')
    );
  },

  /**
   * Update the given nodes in the expression with the new array of nodes
   * taking correcting actions if the lengths do not match.
   *
   * @param {DSLExpression} expression - The expression to update
   * @param {Array} nodes - The node(s) to update
   * @param {Array} newNodes - The node(s) to update with
   * @returns {DSLExpression} expression - The updated expression
   */
  applyUpdate(expression, nodes, newNodes) {
    const updateCount = Math.min(nodes.length, newNodes.length);
    let expressionValue = expression.value;
    let offset = 0;

    // First update nodes
    for (let i = 0; i < updateCount; ++i) {
      const updateNode = nodes[i];
      const withNode = newNodes[i];

      // Update expression value
      const newValue = DSLUpdateUtil.updateNodeString(
        expressionValue, updateNode, withNode, offset
      );

      // This action may have shifted the location of the tokens
      // in the original expression. Update offset.
      offset += newValue.length - expressionValue.length;

      expressionValue = newValue;
    }

    // Then delete nodes
    if (newNodes.length < nodes.length) {
      // We are deleting from the last to the first in order to keep
      // the offsets intact so we don't have to recalculate
      for (let i = nodes.length - 1; i >= updateCount; --i) {
        const deleteNode = nodes[i];
        expressionValue = DSLUpdateUtil.deleteNodeString(
          expressionValue, deleteNode, offset
        );
      }
    }

    // And finally insert new nodes
    if (newNodes.length > nodes.length) {
      const appendNodes = newNodes.slice(updateCount).map((node) => {
        return DSLUtil.getNodeString(node);
      });

      // Add space only if we have an expression already
      if (expressionValue) {
        expressionValue += ' ';
      }

      expressionValue += appendNodes.join(' ');
    }

    // Compile and return the new expression
    return new DSLExpression(expressionValue);
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
  }

};

module.exports = DSLUpdateUtil;
