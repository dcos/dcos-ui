/* @flow */
import React from "react";

type Props = {
  name?: string,
  onChange?: Function,
  value?: number | string
};

const FieldSelect = (props: Props) => {
  return (
    <span className="form-control form-control-select">
      <select {...props}>
        {props.children}
      </select>
    </span>
  );
};

FieldSelect.defaultProps = {
  onChange() {},
  value: ""
};

module.exports = FieldSelect;
