import classNames from "classnames/dedupe";
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
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  textTransform: React.PropTypes.oneOf(["none", "uppercase"])
};

module.exports = FieldHelp;
