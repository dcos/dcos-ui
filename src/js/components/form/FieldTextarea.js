/* @flow */
import classNames from "classnames/dedupe";
import React from "react";

import { omit } from "../../utils/Util";

type Props = {
  onChange?: Function,
  value?: number | string,
  // Classes
  className?: Array<any> | Object | string
};

const FieldTextarea = (props: Props) => {
  const { className } = props;
  const classes = classNames("form-control", className);

  return <textarea className={classes} {...omit(props, ["className"])} />;
};

FieldTextarea.defaultProps = {
  onChange() {},
  value: ""
};

module.exports = FieldTextarea;
