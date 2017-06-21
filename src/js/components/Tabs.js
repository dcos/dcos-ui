import classNames from "classnames/dedupe";
import React from "react";

import TabButtonList from "./TabButtonList";

class Tabs extends React.Component {
  getChildren() {
    const { props } = this;

    return React.Children.map(props.children, tabElement => {
      const newTabProps = { activeTab: props.activeTab };

      if (tabElement.type === TabButtonList) {
        newTabProps.onChange = props.handleTabChange;
        newTabProps.vertical = props.vertical;
      }

      return React.cloneElement(tabElement, newTabProps);
    });
  }

  render() {
    const classes = classNames("menu-tabbed-container", this.props.className, {
      "menu-tabbed-container-vertical": this.props.vertical
    });

    return (
      <div className={classes}>
        {this.getChildren()}
      </div>
    );
  }
}

Tabs.propTypes = {
  // Optional variable to set active tab from owner component
  activeTab: React.PropTypes.string,
  children: React.PropTypes.node.isRequired,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  handleTabChange: React.PropTypes.func.isRequired,
  vertical: React.PropTypes.bool
};

module.exports = Tabs;
