import classNames from "classnames/dedupe";
import React from "react";

import { omit } from "../../utils/Util";

const FieldError = props => {
  const { className } = props;
  const classes = classNames("form-control-feedback", className);

  return (
    <p
      className={classes}
      {...omit(props, Object.keys(FieldError.propTypes))}
    />
  );
};

FieldError.propTypes = {
  // Classes
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = FieldError;
