import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";

class FullScreenModalHeader extends React.Component {
  render() {
    const { children, className } = this.props;
    const classes = classNames("modal-full-screen-header pod", className);

    return <div className={classes}>{children}</div>;
  }
}

const classProps = PropTypes.oneOfType([
  PropTypes.array,
  PropTypes.object,
  PropTypes.string
]);

FullScreenModalHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: classProps
};

export default FullScreenModalHeader;
