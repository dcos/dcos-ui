import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  greyDark,
  iconSizeXs,
  white,
  purple
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import KeyboardUtil from "#SRC/js/utils/KeyboardUtil";
import ServiceFilterTypes from "../../../plugins/services/src/js/constants/ServiceFilterTypes";

const METHODS_TO_BIND = [
  "handleBlur",
  "handleFocus",
  "handleChange",
  "handleInputClear",
  "componentDidMount",
  "handleKeyDown",
  "componentWillUnmount"
];

class FilterInputText extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      focus: false
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    if (this.inputField) {
      this.inputField.addEventListener("keydown", this.handleKeyDown);
    }
  }

  handleKeyDown(event) {
    const { keyCode } = event;
    if (
      keyCode === KeyboardUtil.keyCodes.enter &&
      this.props.onEnter instanceof Function
    ) {
      this.props.onEnter();
    }
  }

  componentWillUnmount() {
    if (this.inputField) {
      this.inputField.removeEventListener("keydown", this.handleKeyDown);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { focus } = this.state;

    if (prevState.focus !== focus && focus && this.inputField) {
      this.inputField.focus();
    }
  }

  handleChange(event) {
    const { target } = event;

    // Make sure to never emit falsy values
    const value = target.value || "";
    this.props.handleFilterChange(value, ServiceFilterTypes.TEXT);
  }

  handleInputClear() {
    this.props.handleFilterChange("", ServiceFilterTypes.TEXT);
  }

  handleBlur() {
    this.setState({
      focus: false
    });
  }

  handleFocus() {
    this.setState({
      focus: true
    });
  }

  getInputField() {
    const { inverseStyle, placeholder, searchString } = this.props;

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
        value={searchString}
      />
    );
  }

  getClearIcon() {
    if (!this.props.searchString) {
      return null;
    }

    const { inverseStyle, sideText } = this.props;
    let color = white;

    if (!inverseStyle) {
      color = purple;
    }

    const iconClassNames = classNames("clickable", {
      "icon-margin-left": !!sideText
    });

    return (
      <span className="form-control-group-add-on">
        {sideText}
        <a onClick={this.handleInputClear}>
          <span className={iconClassNames}>
            <Icon
              shape={SystemIcons.CircleClose}
              size={iconSizeXs}
              color={color}
            />
          </span>
        </a>
      </span>
    );
  }

  render() {
    const { className, inputContainerClass, inverseStyle } = this.props;
    const { focus } = this.state;

    let iconColor = greyDark;
    const iconSearchClasses = classNames({
      active: focus
    });

    if (!inverseStyle && focus) {
      iconColor = purple;
    }

    const inputContainerClasses = classNames(
      {
        focus,
        "form-control form-control-group filter-input-text-group": true,
        "form-control-inverse": inverseStyle
      },
      inputContainerClass
    );

    const formGroupClasses = classNames("form-group", className);

    return (
      <div className={formGroupClasses}>
        <div
          className={inputContainerClasses}
          onClick={this.handleFocus}
          onBlur={this.handleBlur}
        >
          <span
            className={`form-control-group-add-on form-control-group-add-on-prepend ${iconSearchClasses}`}
          >
            <Icon
              shape={SystemIcons.Search}
              size={iconSizeXs}
              color={iconColor}
            />
          </span>
          {this.getInputField()}
          {this.getClearIcon()}
        </div>
      </div>
    );
  }
}

FilterInputText.defaultProps = {
  inverseStyle: false,
  placeholder: "Filter",
  searchString: "",
  sideText: null
};

FilterInputText.propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  inverseStyle: PropTypes.bool,
  placeholder: PropTypes.string,
  searchString: PropTypes.string,
  sideText: PropTypes.node,
  onEnter: PropTypes.func
};

module.exports = FilterInputText;
