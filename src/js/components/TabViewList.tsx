import classNames from "classnames";
import PropTypes from "prop-types";
import * as React from "react";

export default class TabViewList extends React.Component {
  static propTypes = {
    activeTab: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.oneOf([
      PropTypes.array,
      PropTypes.object,
      PropTypes.string
    ])
  };
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

    return <div className={classes}>{this.getChildren()}</div>;
  }
}
