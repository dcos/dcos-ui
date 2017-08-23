/* @flow */
import classNames from "classnames/dedupe";
import React from "react";

type Props = {
  children?: number | string | React.Element | Array<any>,
  className?: Array<any> | Object | string,
};

const AdvancedSectionContent = (props: Props) => {
  const { className, children } = props;
  const classes = classNames("advanced-section-content", className);

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

module.exports = AdvancedSectionContent;
