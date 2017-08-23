/* @flow */
import classNames from "classnames";
import React from "react";

import Util from "../utils/Util";

type Props = {
  className?: Array<any> | Object | string,
  color?: string,
  family?: "product" | "system" | "tiny",
  id: string,
  size?: "tiny" | "mini" | "small" | "medium" | "large" | "jumbo"
};

class Icon extends React.Component {

  render() {
    const { props } = this;

    const additionalProps = Util.omit(props, [
      "className",
      "color",
      "family",
      "id",
      "size"
    ]);
    const classes = classNames(
      "icon",
      {
        [`icon-${props.color}`]: !!props.color,
        [`icon-${props.size}`]: !!props.size
      },
      props.className
    );
    const iconID = `#icon-${props.family}--${props.id}`;

    return (
      <svg className={classes} {...additionalProps}>
        <use xlinkHref={iconID} />
      </svg>
    );
  }
}

Icon.defaultProps = {
  family: "system",
  size: "medium"
};

module.exports = Icon;
