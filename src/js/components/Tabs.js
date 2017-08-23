/* @flow */
import classNames from "classnames/dedupe";
import React from "react";

import TabButtonList from "./TabButtonList";

type Props = {
  // Optional variable to set active tab from owner component
  activeTab?: string,
  children: number | string | React.Element | Array<any>,
  className?: Array<any> | Object | string,
  handleTabChange: Function,
  vertical?: boolean
};

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

module.exports = Tabs;
