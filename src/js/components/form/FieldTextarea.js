import classNames from "classnames/dedupe";
import React from "react";

import { omit } from "../../utils/Util";

const FieldTextarea = props => {
  const { className } = props;
  const classes = classNames("form-control", className);

  return <textarea className={classes} {...omit(props, ["className"])} />;
};

FieldTextarea.defaultProps = {
  onChange() {},
  value: ""
};

FieldTextarea.propTypes = {
  onChange: React.PropTypes.func,
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

module.exports = FieldTextarea;
