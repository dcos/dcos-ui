import classNames from "classnames";
import React from "react";

import Util from "../utils/Util";

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

Icon.propTypes = {
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  color: React.PropTypes.string,
  family: React.PropTypes.oneOf(["product", "system", "tiny"]),
  id: React.PropTypes.string.isRequired,
  size: React.PropTypes.oneOf([
    "tiny",
    "mini",
    "small",
    "medium",
    "large",
    "jumbo"
  ])
};

module.exports = Icon;
