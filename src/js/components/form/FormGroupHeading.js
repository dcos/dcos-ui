/* @flow */
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

type Props = {
  children: number | string | React.Element | Array<any>,
  className?: Array<any> | Object | string,
  required?: boolean,
};

function FormGroupHeading(props: Props) {
  const { className, children, required } = props;
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

module.exports = FormGroupHeading;
