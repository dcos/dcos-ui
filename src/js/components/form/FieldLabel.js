/* @flow */
import classNames from "classnames/dedupe";
import React from "react";

import { findNestedPropertyInObject, omit } from "../../utils/Util";

type Props = {
  children?: number | string | React.Element | Array<any>,
  // Vertically center the element based on the height of input fields
  matchInputHeight?: boolean,
  // Optional boolean to show a required indicator
  required?: boolean,
  // Classes
  className?: Array<any> | Object | string
};

const FieldLabel = (props: Props) => {
  const { children, className, matchInputHeight, required } = props;
  let isToggle = false;
  React.Children.forEach(children, child => {
    const type = findNestedPropertyInObject(child, "props.type");
    if (["radio", "checkbox"].includes(type)) {
      isToggle = true;
    }
  });
  const classes = classNames(
    { "form-control-toggle form-control-toggle-custom": isToggle },
    className
  );

  let requiredNode;
  if (required) {
    requiredNode = <span className="text-danger"> *</span>;
  }

  const label = (
    <label
      className={classes}
      {...omit(props, Object.keys(FieldLabel.propTypes))}
    >
      {children}
      {requiredNode}
    </label>
  );

  if (!matchInputHeight) {
    return label;
  }

  return (
    <div className="form-control-input-height">
      {label}
    </div>
  );
};

module.exports = FieldLabel;
