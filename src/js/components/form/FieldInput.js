import classNames from "classnames/dedupe";
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
  type: React.PropTypes.string,
  onChange: React.PropTypes.func,
  checked: React.PropTypes.bool,
  value: React.PropTypes.oneOfType([
    React.PropTypes.number,
    React.PropTypes.string
  ]),

  // Classes
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = FieldInput;
