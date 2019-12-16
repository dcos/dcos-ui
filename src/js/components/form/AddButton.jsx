import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  iconSizeXxs,
  purple
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

function AddButton({ children, className, icon, onClick }) {
  const classes = classNames(
    "button button-primary-link button-flush",
    className
  );

  return (
    <a className={classes} onClick={onClick}>
      {icon}
      <span>{children}</span>
    </a>
  );
}

AddButton.defaultProps = {
  icon: <Icon color={purple} shape={SystemIcons.Plus} size={iconSizeXxs} />
};

AddButton.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ]),
  icon: PropTypes.node
};

export default AddButton;
