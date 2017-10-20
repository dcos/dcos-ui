import classNames from "classnames";
import React from "react";

const ModalHeading = props => {
  const { children, level } = props;

  return React.createElement(
    `h${level}`,
    {
      className: classNames(`modal-header-title`)
    },
    children
  );
};

ModalHeading.defaultProps = {
  align: "left",
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
