import classNames from "classnames/dedupe";
import * as React from "react";

export default (props: React.HTMLAttributes<HTMLParagraphElement>) => {
  const { className, ...pProps } = props;
  const classes = classNames("form-control-feedback", className);

  return <p className={classes} {...pProps} />;
};
