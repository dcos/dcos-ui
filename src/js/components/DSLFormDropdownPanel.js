import classNames from 'classnames';
import React, {PropTypes} from 'react';

import DSLForm from './DSLForm';
import DSLExpression from '../structs/DSLExpression';

const METHODS_TO_BIND = [
  'handleApply',
  'handleChange',
  'handleReset'
];

/**
 * A SearchDSL component dropdown panel that renders the high-level interaction
 * components for the expression being edited.
 *
 * This component synchronizes
 */
class DSLFormDropdownPanel extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      expression: this.props.expression
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * Import expression property updates
   *
   * @override
   */
  componentWillReceiveProps(nextProps) {
    if (this.props.expression !== nextProps.expression) {
      this.setState({expression: nextProps.expression});
    }
  }

  /**
   * Apply changes to the expression back to the parent component
   */
  handleApply() {
    this.props.onChange(this.state.expression);
    this.props.onClose();
  }

  /**
   * Handle changes to the DSL expression from the form
   *
   * @param {DSLExpression} expression - The new expression
   */
  handleChange(expression) {
    this.setState({expression});
  }

  /**
   * Restore the expression from parent
   */
  handleReset() {
    this.setState({expression: this.props.expression});
  }

  /**
   * @override
   */
  render() {
    let {expression} = this.state;
    let {sections, isVisible} = this.props;

    let dropdownPanelClasses = classNames({
      'dropdown-panel dropdown-panel-animated panel': true,
      'is-visible': isVisible
    });

    return (
      <div className={dropdownPanelClasses}>
        <div className="panel-cell">
          <DSLForm expression={expression}
            onChange={this.handleChange}
            sections={sections} />
        </div>
        <div className="panel-cell text-align-right">
          <a className="button button-small button-link"
            onClick={this.handleReset}>
            RESET
          </a>
          <a className="button button-small button-primary-link"
            onClick={this.handleApply}>
            APPLY
          </a>
        </div>
      </div>
    );
  }
}

DSLFormDropdownPanel.defaultProps = {
  isVisible: false,
  onChange() {},
  onClose() {}
};

DSLFormDropdownPanel.propTypes = {
  expression: PropTypes.instanceOf(DSLExpression).isRequired,
  isVisible: PropTypes.bool,
  onChange: PropTypes.func,
  onClose: PropTypes.func,
  sections: PropTypes.array.isRequired
};

module.exports = DSLFormDropdownPanel;
