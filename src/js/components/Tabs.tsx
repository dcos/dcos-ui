import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import * as React from "react";

import TabButtonList from "./TabButtonList";

export default class Tabs extends React.Component {
  static propTypes = {
    // Optional variable to set active tab from owner component
    activeTab: PropTypes.string,
    children: PropTypes.node.isRequired,
    className: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
      PropTypes.string
    ]),
    handleTabChange: PropTypes.func.isRequired,
    vertical: PropTypes.bool
  };
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

    return <div className={classes}>{this.getChildren()}</div>;
  }
}
