import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";

class FullScreenModalHeaderTitle extends React.Component {
  render() {
    const { children, className } = this.props;
    const classes = classNames("modal-full-screen-header-title", className);

    return <div className={classes}>{children}</div>;
  }
}

const classProps = PropTypes.oneOfType([
  PropTypes.array,
  PropTypes.object,
  PropTypes.string
]);

FullScreenModalHeaderTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: classProps
};

module.exports = FullScreenModalHeaderTitle;
