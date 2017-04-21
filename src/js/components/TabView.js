import classNames from "classnames/dedupe";
import React from "react";

class TabView extends React.Component {
  render() {
    const classes = classNames("menu-tabbed-view", this.props.className);

    return (
      <div className={classes}>
        {this.props.children}
      </div>
    );
  }
}

TabView.propTypes = {
  children: React.PropTypes.node,
  className: React.PropTypes.oneOf([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  id: React.PropTypes.string.isRequired
};

module.exports = TabView;
