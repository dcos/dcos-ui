import classNames from "classnames";
import React, { PropTypes } from "react";

import Icon from "./Icon";
import DSLExpression from "../structs/DSLExpression";
import Util from "../utils/Util";

const DEBOUNCE_TIMEOUT = 250;

const METHODS_TO_BIND = [
  "handleBlur",
  "handleChange",
  "handleDebounceUpdate",
  "handleFocus",
  "handleInputClear"
];

/**
 * This is a very simple, low-level input field for DSL expressions, with
 * embedded clear and dropdown buttons.
 *
 * WARNING: This component is stateless, meaning that the hosting component is
 *          responsible for updating the `expression` property on a change event
 *
 * @example <caption>Using the DSLInputField</caption>
 *
 * <DSLInputField
 *
 *   dropdownVisible={this.state.dropdownVisible}
 *   onDropdownClick={this.handleDropdownToggle}
 *
 *   expression={this.state.expression}
 *   onChange={this.handleChange}
 *
 *   />
 */
class DSLInputField extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      expression: this.props.expression,
      focus: false
    };

    this.debounceTimer = null;

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    this.handleDebounceUpdate = Util.debounce(
      this.handleDebounceUpdate,
      DEBOUNCE_TIMEOUT
    );
  }

  /**
   * Import component property updates.
   *
   * @override
   */
  componentWillReceiveProps(nextProps) {
    const { expression } = nextProps;

    if (expression !== this.state.expression) {
      this.setState({ expression });
    }
  }

  /**
   * Focus to the input field every time the focus state switches to `true`
   *
   * @override
   */
  componentDidUpdate(prevProps, prevState) {
    const { focus } = this.state;

    if (prevState.focus !== focus && focus && this.inputField) {
      this.inputField.focus();
    }
  }

  /**
   * Reset field state to unfocused when the user blurs from the field
   */
  handleBlur() {
    this.setState({
      focus: false
    });
    this.props.onBlur();
  }

  /**
   * Callback with the new text on every keystroke
   *
   * @param {SyntheticEvent} event - The change event
   */
  handleChange(event) {
    this.setState({
      expression: new DSLExpression(event.target.value)
    });

    this.handleDebounceUpdate();
  }

  /**
   * Forward property change update after the debounce timer expired
   */
  handleDebounceUpdate() {
    this.props.onChange(this.state.expression);
  }

  /**
   * Switch to focused state (that triggers .focus to the input field) when
   * the user focuses on the overall component
   */
  handleFocus() {
    this.setState({
      focus: true
    });
    this.props.onFocus();
  }

  /**
   * Callback with empty text  when user clears the input
   */
  handleInputClear() {
    this.props.onChange(new DSLExpression());
  }

  /**
   * Return the "X" button when we have some input
   *
   * @returns {Node|null} The button contents or null if empty
   */
  getClearButton() {
    if (!this.state.expression.defined) {
      return null;
    }

    const { expression } = this.state;
    const { inverseStyle } = this.props;
    let color = "purple";

    if (inverseStyle) {
      color = "white";
    }

    if (expression.hasErrors) {
      color = "red";
    }

    return (
      <span className="form-control-group-add-on">
        <Icon
          family="system"
          id="close"
          size="mini"
          className="clickable"
          color={color}
          onClick={this.handleInputClear}
        />
      </span>
    );
  }

  /**
   * Return the "v" button for showing the filter dropdown
   *
   * @returns {Node|null} The button contents or null if empty
   */
  getDropdownButton() {
    let color = "grey";
    const {
      dropdownVisible,
      hasDropdown,
      inverseStyle,
      onDropdownClick
    } = this.props;

    if (!hasDropdown) {
      return null;
    }

    if (inverseStyle) {
      color = "white";
    }

    if (dropdownVisible) {
      color = "purple";
    }

    return (
      <span className="form-control-group-add-on">
        <Icon
          family="system"
          id="caret-down"
          size="mini"
          className="clickable"
          color={color}
          onClick={onDropdownClick}
        />
      </span>
    );
  }

  /**
   * Return input field with it's proper style
   *
   * @returns {Node} The input field
   */
  getInputField() {
    const { expression } = this.state;
    const { inverseStyle, placeholder } = this.props;

    const inputClasses = classNames({
      "form-control filter-input-text": true,
      "form-control-inverse": inverseStyle
    });

    return (
      <input
        className={inputClasses}
        placeholder={placeholder}
        onChange={this.handleChange}
        ref={ref => (this.inputField = ref)}
        type="text"
        value={expression.value}
      />
    );
  }

  render() {
    const { className, inputContainerClass, inverseStyle } = this.props;
    const { expression, focus } = this.state;

    let iconColor = "grey";
    const iconSearchClasses = classNames({
      active: focus
    });

    if (!inverseStyle && (focus || expression.defined)) {
      iconColor = "purple";
    }

    if (expression.hasErrors) {
      iconColor = "red";
    }

    const inputContainerClasses = classNames(
      {
        focus,
        "form-control form-control-group": true,
        "form-control-inverse": inverseStyle
      },
      inputContainerClass
    );

    const formGroupClasses = classNames(
      {
        "form-group": true,
        "form-group-danger": expression.hasErrors
      },
      className
    );

    return (
      <div className={formGroupClasses}>
        <div
          className={inputContainerClasses}
          onClick={this.handleFocus}
          onBlur={this.handleBlur}
        >
          <span className="form-control-group-add-on form-control-group-add-on-prepend">
            <Icon
              family="system"
              id="search"
              size="mini"
              className={iconSearchClasses}
              color={iconColor}
            />
          </span>
          {this.getInputField()}
          {this.getClearButton()}
          {this.getDropdownButton()}
        </div>
      </div>
    );
  }
}

DSLInputField.defaultProps = {
  className: {},
  dropdownVisible: false,
  hasDropdown: true,
  inverseStyle: false,
  onChange() {},
  onBlur() {},
  onDropdownClick() {},
  onFocus() {},
  placeholder: "Filter"
};

DSLInputField.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  dropdownVisible: PropTypes.bool,
  hasDropdown: PropTypes.bool,
  inverseStyle: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onDropdownClick: PropTypes.func,
  onFocus: PropTypes.func,
  placeholder: PropTypes.string,
  expression: PropTypes.instanceOf(DSLExpression).isRequired
};

module.exports = DSLInputField;
