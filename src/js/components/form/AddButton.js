/* @flow */
import classNames from "classnames/dedupe";
import React from "react";

import Icon from "../Icon";

type Props = {
  children?: "*",
  onClick?: Function,
  className?: Array<any> | Object | string,
  icon?: "*"
};

function AddButton(props: Props) {
  const { children, className, icon, onClick } = props;
  const classes = classNames(
    "button button-primary-link button-flush",
    className
  );

  return (
    <a className={classes} onClick={onClick}>
      {icon}
      <span>
        {children}
      </span>
    </a>
  );
}

AddButton.defaultProps = {
  icon: <Icon color="purple" id="plus" size="tiny" />
};

module.exports = AddButton;
