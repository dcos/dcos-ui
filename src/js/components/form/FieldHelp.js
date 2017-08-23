/* @flow */
import classNames from "classnames/dedupe";
import React from "react";

import { omit } from "../../utils/Util";

type Props = {
  // Classes
  className?: Array<any> | Object | string,
  textTransform?: "none" | "uppercase"
};

const FieldHelp = (props: Props) => {
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

module.exports = FieldHelp;
