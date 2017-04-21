import classNames from "classnames/dedupe";
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
      {children}
    </a>
  );
}

AddButton.defaultProps = {
  icon: <Icon color="purple" id="plus" size="tiny" />
};

AddButton.propTypes = {
  children: React.PropTypes.node,
  onClick: React.PropTypes.func,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  icon: React.PropTypes.node
};

module.exports = AddButton;
