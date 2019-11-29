import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";

import FieldError from "./FieldError";
import { omit } from "../../utils/Util";

const FormGroup = props => {
  const {
    children,
    className,
    errorClassName,
    hasNarrowMargins,
    applyLabelOffset,
    showError
  } = props;

  const clonedChildren = React.Children.map(children, child => {
    if (child != null && !showError && child.type === FieldError) {
      return null;
    }

    return child;
  });

  const classes = classNames(
    {
      [errorClassName]: showError,
      "form-group-without-top-label": applyLabelOffset,
      "column-auto flush-left flush-right": hasNarrowMargins
    },
    "form-group",
    className
  );

  return (
    <div className={classes} {...omit(props, Object.keys(FormGroup.propTypes))}>
      {clonedChildren}
    </div>
  );
};

FormGroup.defaultProps = {
  errorClassName: "form-group-danger",
  applyLabelOffset: false,
  hasNarrowMargins: false
};

const classPropType = PropTypes.oneOfType([
  PropTypes.array,
  PropTypes.object,
  PropTypes.string
]);

FormGroup.propTypes = {
  children: PropTypes.node,
  // Optional boolean to display error
  showError: PropTypes.bool,

  // Classes
  className: classPropType,
  // Class to be toggled, can be overridden by className
  errorClassName: PropTypes.string,
  // When true, will add padding to the top of the form group to vertically
  // align it with its siblings that have labels.
  applyLabelOffset: PropTypes.bool,
  // When true, the component will apply specific styles for use with the delete
  // row button
  hasNarrowMargins: PropTypes.bool
};

export default FormGroup;
