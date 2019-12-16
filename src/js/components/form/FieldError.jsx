import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
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
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ])
};

export default FieldError;
