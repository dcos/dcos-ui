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
  flush: true,
  level: 2
};

ModalHeading.propTypes = {
  children: React.PropTypes.node.isRequired,
  level: React.PropTypes.oneOf([1, 2, 3, 4, 5, 6])
};

module.exports = ModalHeading;
