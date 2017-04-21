import classNames from "classnames";
import React from "react";

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

TabViewList.propTypes = {
  activeTab: React.PropTypes.string,
  children: React.PropTypes.node,
  className: React.PropTypes.oneOf([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = TabViewList;
