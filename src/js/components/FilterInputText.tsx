import classNames from "classnames";
import * as React from "react";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  greyDark,
  iconSizeXs,
  white,
  purple
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import keyCodes from "#SRC/js/utils/KeyboardUtil";

enum ServiceFilterType {
  health = "filterHealth",
  other = "filterOther",
  status = "filterStatus",
  labels = "filterLabels",
  text = "searchString"
}

export default class FilterInputText extends React.Component<{
  // type is actually ServiceFilterType
  className?: string;
  inputContainerClass?: string;
  handleFilterChange: (s: string, type: ServiceFilterType) => void;
  inverseStyle?: boolean;
  onEnter?: () => void;
  placeholder?: string;
  searchString?: string;
  sideText?: React.ReactNode | null;
}> {
  static defaultProps = {
    inverseStyle: false,
    placeholder: "Filter",
    searchString: "",
    sideText: null
  };

  inputField?: HTMLInputElement | null;
  state = { focus: false };

  handleKeyDown = ({ keyCode }: React.KeyboardEvent<HTMLInputElement>) => {
    if (keyCode === keyCodes.enter) {
      this.props.onEnter?.();
    }
  };

  componentDidUpdate(_prevProps, prevState) {
    if (!prevState.focus && this.state.focus) {
      this.inputField?.focus();
    }
  }

  handleChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    // Make sure to never emit falsy values
    this.props.handleFilterChange(target.value || "", ServiceFilterType.text);
  };

  handleInputClear = () => {
    this.props.handleFilterChange("", ServiceFilterType.text);
  };

  handleBlur = () => {
    this.setState({ focus: false });
  };

  handleFocus = () => {
    this.setState({ focus: true });
  };

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
        onKeyDown={this.handleKeyDown}
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
