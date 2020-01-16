import { Trans } from "@lingui/macro";
import classNames from "classnames";
import PropTypes from "prop-types";
import * as React from "react";
import isEqual from "lodash.isequal";

import DSLForm from "./DSLForm";
import DSLExpression from "../structs/DSLExpression";

/**
 * A SearchDSL component dropdown panel that renders the high-level interaction
 * components for the expression being edited.
 *
 * This component synchronizes
 */
class DSLFormDropdownPanel extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      expression: this.props.expression
    };
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.isVisible !== nextProps.isVisible ||
      this.props.expression.value !== nextProps.expression.value ||
      !isEqual(this.props.sections, nextProps.sections)
    );
  }

  /**
   * Import expression property updates and reset expression when the dropdown
   * is first shown.
   *
   * @override
   */
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.props.expression !== nextProps.expression ||
      (!this.props.isVisible && nextProps.isVisible)
    ) {
      this.setState({ expression: nextProps.expression });
    }
  }

  /**
   * Apply changes to the expression back to the parent component
   */
  handleApply = () => {
    this.props.onChange(this.state.expression);
    this.props.onClose();
  };

  /**
   * Handle changes to the DSL expression from the form
   *
   * @param {DSLExpression} expression - The new expression
   */
  handleChange = expression => {
    this.setState({ expression });
    this.props.onChange(expression);
  };

  /**
   * @override
   */
  render() {
    const { expression } = this.state;
    const { sections, isVisible, defaultData } = this.props;

    const dropdownPanelClasses = classNames({
      "dsl-dropdown-panel dropdown-panel dropdown-panel-animated panel": true,
      "is-visible": isVisible
    });

    return (
      <div className={dropdownPanelClasses}>
        <div className="panel-cell panel-cell-borderless flush-bottom">
          <DSLForm
            expression={expression}
            onChange={this.handleChange}
            onApply={this.handleApply}
            sections={sections}
            defaultData={defaultData}
          />
        </div>
        <div className="panel-cell panel-cell-short flush-top text-align-right">
          <a
            className="button button-small button-primary-link flush-right"
            onClick={this.handleApply}
          >
            <Trans render="span">Apply</Trans>
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

export default DSLFormDropdownPanel;
