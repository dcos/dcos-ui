import classNames from "classnames";
import PropTypes from "prop-types";
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
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ]),
  level: PropTypes.oneOf([1, 2, 3, 4, 5, 6])
};

export default ConfigurationMapHeading;
