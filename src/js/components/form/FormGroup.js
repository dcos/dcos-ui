/* @flow */
import classNames from "classnames/dedupe";
import React from "react";

import FieldError from "./FieldError";
import { omit } from "../../utils/Util";

type Props = {
  children?: number | string | React.Element | Array<any>,
  // Optional boolean to display error
  showError?: boolean,
  // Classes
  className?: classPropType,
  // Class to be toggled, can be overridden by className
  errorClassName?: string,
  // When true, will add padding to the top of the form group to vertically
  // align it with its siblings that have labels.
  applyLabelOffset?: boolean,
  // When true, the component will apply specific styles for use with the delete
  // row button
  hasNarrowMargins?: boolean
};

const FormGroup = (props: Props) => {
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

const classPropType = React.PropTypes.oneOfType([
  React.PropTypes.array,
  React.PropTypes.object,
  React.PropTypes.string
]);

module.exports = FormGroup;
