import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";

import { omit } from "../../utils/Util";

const FieldInput = props => {
  const { className, type } = props;
  const classes = classNames("form-control", className);

  let toggleIndicator;
  if (["radio", "checkbox"].includes(type)) {
    toggleIndicator = <span className="form-control-toggle-indicator" />;
  }

  return (
    <span>
      <input className={classes} {...omit(props, ["className"])} />
      {toggleIndicator}
    </span>
  );
};

FieldInput.defaultProps = {
  onChange() {},
  value: ""
};

FieldInput.propTypes = {
  type: PropTypes.string,
  onChange: PropTypes.func,
  checked: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.bool
  ]),

  // Classes
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ])
};

module.exports = FieldInput;
