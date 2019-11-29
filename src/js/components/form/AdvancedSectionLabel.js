import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  iconSizeXxs,
  purple
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

function getStateIndicator(isExpanded) {
  let iconID = SystemIcons.TriangleRight;

  if (isExpanded) {
    iconID = SystemIcons.TriangleDown;
  }

  return <Icon shape={iconID} color={purple} size={iconSizeXxs} />;
}

const AdvancedSectionLabel = ({ className, children, isExpanded, onClick }) => {
  const classes = classNames(
    "advanced-section-label clickable button button-primary-link button-flush",
    className
  );

  return (
    <a className={classes} onClick={onClick}>
      {getStateIndicator(isExpanded)}
      <span>{children}</span>
    </a>
  );
};

AdvancedSectionLabel.propTypes = {
  children: PropTypes.node,
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ]),
  isExpanded: PropTypes.bool,
  onClick: PropTypes.func
};

export default AdvancedSectionLabel;
