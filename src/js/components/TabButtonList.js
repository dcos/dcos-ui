import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";

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

    return <div className={classes}>{this.getChildren()}</div>;
  }
}

TabButtonList.propTypes = {
  activeTab: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ]),
  onChange: PropTypes.func,
  vertical: PropTypes.bool
};

export default TabButtonList;
