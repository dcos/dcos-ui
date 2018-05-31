import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";

class TabView extends React.Component {
  render() {
    const classes = classNames("menu-tabbed-view", this.props.className);

    return <div className={classes}>{this.props.children}</div>;
  }
}

TabView.propTypes = {
  children: PropTypes.node,
  className: PropTypes.oneOf([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ]),
  id: PropTypes.string.isRequired
};

module.exports = TabView;
