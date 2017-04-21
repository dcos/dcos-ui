import classNames from "classnames";
import React from "react";

const DetailViewSectionHeading = props => {
  const { children, className, level } = props;

  const headingProps = {
    className: classNames(
      "detail-view-section-heading",
      { "detail-view-section-heading-primary": level === 1 },
      className
    )
  };

  return React.createElement(`h${level}`, headingProps, children);
};

DetailViewSectionHeading.defaultProps = {
  level: 1
};

DetailViewSectionHeading.propTypes = {
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  level: React.PropTypes.oneOf([1, 2, 3, 4, 5, 6])
};

module.exports = DetailViewSectionHeading;
