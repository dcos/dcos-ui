import classNames from "classnames";
import * as React from "react";
import { ClassValue } from "classnames/types";

const DetailViewSectionHeading = (props: {
  children?: React.ReactNode;
  className?: ClassValue;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}) => {
  const { children, className, level } = props;

  const headingProps = {
    className: classNames(
      "detail-view-section-heading",
      { "detail-view-section-heading-primary": level === 1 },
      className
    ),
  };

  return React.createElement(`h${level}`, headingProps, children);
};

export default DetailViewSectionHeading;
