import classNames from "classnames";
import * as React from "react";
import { ClassValue } from "classnames/types";

import DetailViewSectionHeading from "./DetailViewSectionHeading";

const ConfigurationMapHeading = (props: {
  children?: React.ReactNode;
  className?: ClassValue;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}) => {
  const { children, className, level = 1 } = props;
  const classes = classNames("configuration-map-heading", className);

  return (
    <DetailViewSectionHeading className={classes} level={level}>
      {children}
    </DetailViewSectionHeading>
  );
};

export default ConfigurationMapHeading;
