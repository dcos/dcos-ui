import classNames from "classnames";
import PropTypes from "prop-types";
import * as React from "react";

const ToggleButton = props => {
  const { checkboxClassName, checked, children, className, onChange } = props;

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
};

ToggleButton.defaultProps = {
  checked: false,
  onChange: () => undefined,
  checkboxClassName: "toggle-button"
};

ToggleButton.propTypes = {
  checked: PropTypes.bool,
  children: PropTypes.node,
  onChange: PropTypes.func,

  checkboxClassName: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ]),
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ])
};

export default ToggleButton;
