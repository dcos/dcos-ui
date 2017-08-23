/* @flow */
import classNames from "classnames/dedupe";
import React from "react";

import { omit } from "../../utils/Util";

type Props = {
  type?: string,
  onChange?: Function,
  checked?: boolean,
  value?: number | string,
  // Classes
  className?: Array<any> | Object | string
};

const FieldInput = (props: Props) => {
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

module.exports = FieldInput;
