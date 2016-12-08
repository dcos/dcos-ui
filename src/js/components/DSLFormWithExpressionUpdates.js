import React, {PropTypes} from 'react';

import DSLCombinerTypes from '../constants/DSLCombinerTypes';
import DSLFilterTypes from '../constants/DSLFilterTypes';
import DSLUpdatePolicy from '../constants/DSLUpdatePolicy';
import DSLExpression from '../structs/DSLExpression';
import DSLUpdateUtil from '../utils/DSLUpdateUtil';
import DSLUtil from '../utils/DSLUtil';
import {FilterNode} from '../structs/DSLASTNodes';

const METHODS_TO_BIND = [
  'handleFormChange',
  'handleFormSubmit'
];

/**
 * This <form /> component wraps a set of <input /> elements and automates
 * the update of the DSL expression based on the part definition given.
 */
class DSLFormWithExpressionUpdates extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * Handle a change to the form
   */
  handleFormChange({target}) {
    let {
      expression,
      groupCombiner,
      itemCombiner,
      onChange,
      parts,
      updatePolicy
    } = this.props;
    let value = target.value;

    const name = target.getAttribute('name');
    if (!name) {
      return;
    }

    if (target.type === 'checkbox') {
      value = target.checked;
    }

    // Locate the respective DSL part node
    const partNode = parts[name];
    if (partNode == null) {
      return;
    }

    // Locate all the current tokens of the expression that the filter match
    const matchingNodes = DSLUtil.findNodesByFilter(expression.ast, partNode);

    switch (partNode.filterType) {
      //
      // The way an attribute updates depends on the `dslUpdatePolicy`.
      //
      // In case of Checkbox poliy, the attribute is added/removed, but in Radio
      // policy the previous labels must be removed.
      //
      case DSLFilterTypes.ATTRIB:

        // On 'Radio' update policy the new value is replacing any occurence
        // of all of the specified nodes.
        if (updatePolicy === DSLUpdatePolicy.Radio) {
          if (value) {
            expression = DSLUpdateUtil.applyReplace(
              expression, matchingNodes, [partNode], groupCombiner, itemCombiner
            );
          } else {
            expression = DSLUpdateUtil.applyDelete(
              expression, matchingNodes
            );
          }
          break;
        }

        // On 'Checkbox' policy, we just add/remove the matching AST node
        if (value) {
          expression = DSLUpdateUtil.applyAdd(
            expression, [partNode], groupCombiner, itemCombiner
          );
        } else {
          expression = DSLUpdateUtil.applyDelete(
            expression, matchingNodes
          );
        }
        break;

      //
      // The exact attribute updates just replaces the node with a new text
      //
      case DSLFilterTypes.EXACT:
        const newExactNode = new FilterNode(0, 0, DSLFilterTypes.EXACT, {
          text: value
        });

        expression = DSLUpdateUtil.applyReplace(
          expression, matchingNodes, [newExactNode], groupCombiner
        );
        break;

      //
      // The fuzzy attribute replaces as many attributes as in the new text
      //
      case DSLFilterTypes.FUZZY:
        const newFuzzyNodes = value.replace(':', ' ').split(' ').map((text) => {
          return new FilterNode(0, 0, DSLFilterTypes.FUZZY, {text});
        });

        // And replace the existing fuzzy nodes
        expression = DSLUpdateUtil.applyReplace(
          expression, matchingNodes, newFuzzyNodes, groupCombiner
        );
        break;
    }

    // Callback with the new expression
    onChange(expression);
  }

  handleFormSubmit(event) {
    event.preventDefault();
    this.props.onSubmit();
  }

  /**
   * @override
   */
  render() {
    return (
      <form className="form-group tall"
        onChange={this.handleFormChange}
        onSubmit={this.handleFormSubmit}>
        {this.props.children}
      </form>
    );
  }
}

DSLFormWithExpressionUpdates.defaultProps = {
  groupCombiner: DSLCombinerTypes.AND,
  itemCombiner: DSLCombinerTypes.AND,
  onChange() {},
  onSubmit() {},
  updatePolicy: DSLUpdatePolicy.Checkbox
};

DSLFormWithExpressionUpdates.propTypes = {
  expression: PropTypes.instanceOf(DSLExpression).isRequired,
  groupCombiner: PropTypes.oneOf(
    Object.keys(DSLCombinerTypes).map((key) => DSLCombinerTypes[key])
  ),
  itemCombiner: PropTypes.oneOf(
    Object.keys(DSLCombinerTypes).map((key) => DSLCombinerTypes[key])
  ),
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  parts: PropTypes.objectOf(PropTypes.instanceOf(FilterNode)).isRequired,
  updatePolicy: PropTypes.oneOf(
    Object.keys(DSLUpdatePolicy).map((key) => DSLUpdatePolicy[key])
  )
};

module.exports = DSLFormWithExpressionUpdates;
