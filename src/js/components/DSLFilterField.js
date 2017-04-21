import React, { PropTypes } from "react";

import DSLFilterList from "../structs/DSLFilterList";
import DSLInputField from "./DSLInputField";
import DSLExpression from "../structs/DSLExpression";
import DSLFormDropdownPanel from "./DSLFormDropdownPanel";

const METHODS_TO_BIND = [
  "handleDismissClick",
  "handleDropdownClick",
  "handleIgnoreClick",
  "handleDropdownClose"
];

/**
 * This component interactively edits a DSL expression and calls back with the
 * filtering function when there is a change.
 */
class DSLFilterField extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      dropdownVisible: false
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * Listen for body-wide events for dismissing the panel
   * @override
   */
  componentDidMount() {
    global.addEventListener("click", this.handleDismissClick, false);
  }

  /**
   * Remove body-wide listeners
   * @override
   */
  componentWillUnmount() {
    global.removeEventListener("click", this.handleDismissClick);
  }

  /**
   * Component should update only when filters or expressions changes
   *
   * @override
   */
  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.expression !== nextProps.expression ||
      this.props.filters !== nextProps.filters ||
      this.state.dropdownVisible !== nextState.dropdownVisible
    );
  }

  /**
   * Clicks on the body are dismissing the panel
   */
  handleDismissClick() {
    if (!this.state.dropdownVisible) {
      return;
    }

    this.setState({ dropdownVisible: false });
  }

  /**
   * Handle click on the dropdown button of the input field
   */
  handleDropdownClick() {
    this.setState({ dropdownVisible: !this.state.dropdownVisible });
  }

  /**
   * Handle closing of the dropdown
   */
  handleDropdownClose() {
    this.setState({ dropdownVisible: false });
  }

  /**
   * Clicks on the panel region are stopped in order for them not to reach
   * the body handler (that dismisses the dropdown)
   *
   * @param {SyntheticEvent} event - The click event
   */
  handleIgnoreClick(event) {
    event.stopPropagation();
  }

  render() {
    const { expression, formSections, onChange } = this.props;
    const { dropdownVisible } = this.state;
    const hasForm = formSections.length > 0;

    return (
      <div
        className="form-group dropdown-panel-group"
        onClick={this.handleIgnoreClick}
      >

        <DSLInputField
          hasErrors={expression.hasErrors}
          hasDropdown={hasForm}
          dropdownVisible={dropdownVisible}
          onChange={onChange}
          onDropdownClick={this.handleDropdownClick}
          expression={expression}
        />

        <DSLFormDropdownPanel
          expression={expression}
          isVisible={dropdownVisible}
          onChange={onChange}
          onClose={this.handleDropdownClose}
          sections={formSections}
        />
      </div>
    );
  }
}

DSLFilterField.defaultProps = {
  formSections: [],
  onChange() {}
};

DSLFilterField.propTypes = {
  expression: PropTypes.instanceOf(DSLExpression).isRequired,
  filters: PropTypes.instanceOf(DSLFilterList).isRequired,
  formSections: PropTypes.array,
  onChange: PropTypes.func
};

module.exports = DSLFilterField;
