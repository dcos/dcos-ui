import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";

import Icon from "../Icon";

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
  icon: <Icon color="purple" id="plus" size="tiny" />
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

module.exports = AddButton;
