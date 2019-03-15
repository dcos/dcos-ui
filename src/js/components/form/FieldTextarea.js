import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
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
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  // Classes
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ])
};

export default FieldTextarea;
