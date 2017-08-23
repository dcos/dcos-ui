/* @flow */
import classNames from "classnames/dedupe";
import React from "react";

import { omit } from "../../utils/Util";

type Props = {
  // Classes
  className?: Array<any> | Object | string
};

const FieldError = (props: Props) => {
  const { className } = props;
  const classes = classNames("form-control-feedback", className);

  return (
    <p
      className={classes}
      {...omit(props, Object.keys(FieldError.propTypes))}
    />
  );
};

module.exports = FieldError;
