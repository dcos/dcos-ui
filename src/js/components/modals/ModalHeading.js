import classNames from "classnames";
import React from "react";

const ModalHeading = props => {
  const { align, children, className, flush, level } = props;

  return React.createElement(
    `h${level}`,
    {
      className: classNames(
        `text-align-${align}`,
        {
          flush
        },
        className
      )
    },
    children
  );
};

ModalHeading.defaultProps = {
  align: "center",
  flush: true,
  level: 2
};

ModalHeading.propTypes = {
  align: React.PropTypes.oneOf(["left", "right", "center"]),
  children: React.PropTypes.node.isRequired,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  flush: React.PropTypes.bool,
  level: React.PropTypes.oneOf([1, 2, 3, 4, 5, 6])
};

module.exports = ModalHeading;
