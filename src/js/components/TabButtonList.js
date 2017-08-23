/* @flow */
import classNames from "classnames/dedupe";
import React from "react";

type Props = {
  activeTab?: string,
  children?: number | string | React.Element | Array<any>,
  className?: Array<any> | Object | string,
  onChange?: Function,
  vertical?: boolean
};

class TabButtonList extends React.Component {

  getChildren() {
    const { activeTab, children, onChange } = this.props;

    return React.Children.map(children, (tab, index) => {
      if (tab === null) {
        return tab;
      }
      const tabProps = { activeTab, onClick: onChange };

      if (tab.props.id === activeTab || (!activeTab && index === 0)) {
        tabProps.active = true;
      }

      return React.cloneElement(tab, tabProps);
    });
  }

  render() {
    const { className, vertical } = this.props;
    const classes = classNames(
      "menu-tabbed",
      {
        "menu-tabbed-vertical": vertical
      },
      className
    );

    return (
      <div className={classes}>
        {this.getChildren()}
      </div>
    );
  }
}

module.exports = TabButtonList;
