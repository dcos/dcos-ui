import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";

class FullScreenModalHeaderSubTitle extends React.Component {
  render() {
    const { children, className } = this.props;
    const classes = classNames("small", className);

    return <div className={classes}>{children}</div>;
  }
}

const classProps = PropTypes.oneOfType([
  PropTypes.array,
  PropTypes.object,
  PropTypes.string
]);

FullScreenModalHeaderSubTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: classProps
};

module.exports = FullScreenModalHeaderSubTitle;
