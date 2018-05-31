import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";

import { findNestedPropertyInObject, omit } from "../../utils/Util";

const FieldLabel = props => {
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

  return <div className="form-control-input-height">{label}</div>;
};

FieldLabel.propTypes = {
  children: PropTypes.node,
  // Vertically center the element based on the height of input fields
  matchInputHeight: PropTypes.bool,
  // Optional boolean to show a required indicator
  required: PropTypes.bool,

  // Classes
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ])
};

module.exports = FieldLabel;
