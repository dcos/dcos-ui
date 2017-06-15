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

function FormGroupHeadingContent({ className, children, primary, title }) {
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

FormGroupHeadingContent.propTypes = {
  children: React.PropTypes.node,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  primary: React.PropTypes.bool,
  title: React.PropTypes.string
};

module.exports = FormGroupHeadingContent;
