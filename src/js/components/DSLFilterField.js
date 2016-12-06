import React, {PropTypes} from 'react';

import DSLFilterList from '../structs/DSLFilterList';
import DSLInputField from './DSLInputField';
import DSLExpression from '../structs/DSLExpression';

const METHODS_TO_BIND = [
  'handleChange'
];

/**
 * This component interactively edits a DSL expression and calls back with the
 * filtering function when there is a change.
 */
class DSLFilterField extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * Component should update only when fiters or expressions changes
   *
   * @override
   */
  shouldComponentUpdate(nextProps) {
    return (this.props.expression !== nextProps.expression) ||
           (this.props.filters !== nextProps.filters);
  }

  /**
   * Update the internal representation of the DSL expression
   *
   * @param {String} expressionString - The new DSL expression to process
   */
  handleChange(expressionString) {
    this.props.onChange(
      new DSLExpression(expressionString)
    );
  }

  render() {
    let {expression} = this.props;

    return (
      <DSLInputField
        hasDropdown={false}
        hasErrors={expression.hasErrors}
        onChange={this.handleChange}
        value={expression.value} />
    );
  }
}

DSLFilterField.defaultProps = {
  onChange() {}
};

DSLFilterField.propTypes = {
  expression: PropTypes.instanceOf(DSLExpression).isRequired,
  filters: PropTypes.instanceOf(DSLFilterList).isRequired,
  onChange: PropTypes.func
};

module.exports = DSLFilterField;
