/* @flow */
import classNames from "classnames";
import React from "react";

import Config from "../../config/Config";

function getTitle(children) {
  if (typeof children === "string") {
    return children;
  }

  if (Config.environment === "development") {
    console.warn(
      "Primary FormGroupHeadingContent elements should be given " +
        "a title attribute."
    );
  }

  return null;
}

type Props = {
  children?: number | string | React.Element | Array<any>,
  className?: Array<any> | Object | string,
  primary?: boolean,
  title?: string,
};

function FormGroupHeadingContent(props: Props) {
  const { className, children, primary, title } = props;
  if (children == null) {
    return <noscript />;
  }

  const classes = classNames("form-group-heading-content", className, {
    "form-group-heading-content-primary": primary
  });

  if (primary && !title) {
    title = getTitle(children);
  }

  return (
    <div className={classes} title={title}>
      {children}
    </div>
  );
}

FormGroupHeadingContent.defaultProps = {
  primary: false
};

module.exports = FormGroupHeadingContent;
