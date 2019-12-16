import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";

import { omit } from "../../utils/Util";

const FieldHelp = props => {
  const { className, textTransform } = props;
  const classes = classNames("form-control-feedback", className, {
    "text-uppercase": textTransform === "uppercase",
    "text-no-transform": textTransform === "none"
  });

  return (
    <p className={classes} {...omit(props, Object.keys(FieldHelp.propTypes))} />
  );
};

FieldHelp.defaultProps = {
  textTransform: "none"
};

FieldHelp.propTypes = {
  // Classes
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ]),
  textTransform: PropTypes.oneOf(["none", "uppercase"])
};

export default FieldHelp;
