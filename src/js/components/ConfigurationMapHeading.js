import classNames from "classnames";
import React from "react";

import DetailViewSectionHeading from "./DetailViewSectionHeading";

const ConfigurationMapHeading = props => {
  const { children, className, level } = props;
  const classes = classNames("configuration-map-heading", className);

  return (
    <DetailViewSectionHeading className={classes} level={level}>
      {children}
    </DetailViewSectionHeading>
  );
};

ConfigurationMapHeading.defaultProps = {
  level: 1
};

ConfigurationMapHeading.propTypes = {
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  level: React.PropTypes.oneOf([1, 2, 3, 4, 5, 6])
};

module.exports = ConfigurationMapHeading;
