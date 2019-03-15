import classNames from "classnames";
import PropTypes from "prop-types";
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
  children: PropTypes.node,
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ]),
  primary: PropTypes.bool,
  title: PropTypes.string
};

export default FormGroupHeadingContent;
