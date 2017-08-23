/* @flow */
import classNames from "classnames";
import React from "react";

type Props = {
  checked?: boolean,
  children?: number | string | React.Element | Array<any>,
  onChange?: Function,
  checkboxClassName?: Array<any> | Object | string,
  className?: Array<any> | Object | string
};

class ToggleButton extends React.Component {

  render() {
    const {
      checkboxClassName,
      checked,
      children,
      className,
      onChange
    } = this.props;

    const textClassName = { muted: !checked };

    return (
      <label className={classNames(className)}>
        <input
          className={classNames(checkboxClassName)}
          checked={checked}
          name="checkbox"
          onChange={onChange}
          type="checkbox"
        />
        <span className={classNames(textClassName)}>{children}</span>
      </label>
    );
  }
}

ToggleButton.defaultProps = {
  checked: false,
  onChange() {},
  checkboxClassName: "toggle-button"
};

module.exports = ToggleButton;
