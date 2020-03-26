import classNames from "classnames";
import * as React from "react";

export default (props: {
  children?: React.ReactNode;
  isCaret?: boolean;
  isIcon?: boolean;
  title: string;
}) => {
  const { isCaret, isIcon } = props;

  if (!props.children) {
    return <noscript />;
  }

  const classes = classNames("breadcrumb", {
    "breadcrumb--is-caret": isCaret,
    "breadcrumb--is-icon": isIcon,
  });

  return <div className={classes}>{props.children}</div>;
};
