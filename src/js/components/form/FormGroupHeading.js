import classNames from "classnames";
import React from "react";

import FormGroupHeadingContent from "./FormGroupHeadingContent";

function injectAsteriskNode(children) {
  const asteriskNode = (
    <FormGroupHeadingContent className="text-danger" key="asterisk">
      *
    </FormGroupHeadingContent>
  );
  const nextChildren = React.Children.toArray(children);

  nextChildren.splice(1, 0, asteriskNode);

  return nextChildren;
}

function FormGroupHeading({ className, children, required }) {
  const classes = classNames("form-group-heading", className);

  return (
    <div className={classes}>
      {required ? injectAsteriskNode(children) : children}
    </div>
  );
}

FormGroupHeading.defaultProps = {
  required: false
};

FormGroupHeading.propTypes = {
  children: React.PropTypes.node.isRequired,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  required: React.PropTypes.bool
};

module.exports = FormGroupHeading;
