/* @flow */
import classNames from "classnames/dedupe";
import React from "react";

import Icon from "../Icon";

function getStateIndicator(isExpanded) {
  let iconID = "triangle-right";

  if (isExpanded) {
    iconID = "triangle-down";
  }

  return <Icon id={iconID} color="purple" family="tiny" size="tiny" />;
}

type Props = {
  children?: number | string | React.Element | Array<any>,
  className?: Array<any> | Object | string,
  isExpanded?: boolean,
  onClick?: Function,
};

const AdvancedSectionLabel = (props: Props) => {
  const { className, children, isExpanded, onClick } = props;
  const classes = classNames(
    "advanced-section-label clickable button button-primary-link button-flush",
    className
  );

  return (
    <a className={classes} onClick={onClick}>
      {getStateIndicator(isExpanded)}
      <span>
        {children}
      </span>
    </a>
  );
};

module.exports = AdvancedSectionLabel;
