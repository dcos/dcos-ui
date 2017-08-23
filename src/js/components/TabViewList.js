/* @flow */
import classNames from "classnames";
import React from "react";

type Props = {
  activeTab?: string,
  children?: number | string | React.Element | Array<any>,
  className?: Array<any> | Object | string
};

class TabViewList extends React.Component {

  getChildren() {
    const { activeTab, children } = this.props;

    return React.Children.map(children, (tab, index) => {
      if (tab.props.id === activeTab || (!activeTab && index === 0)) {
        return tab;
      }

      return null;
    });
  }

  render() {
    const classes = classNames(
      "menu-tabbed-view-container",
      this.props.classNames
    );

    return (
      <div className={classes}>
        {this.getChildren()}
      </div>
    );
  }
}

module.exports = TabViewList;
