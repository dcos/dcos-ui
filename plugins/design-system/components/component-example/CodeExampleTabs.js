import classNames from "classnames/dedupe";
import React from "react";

import CodeExampleTabButtonList from "./CodeExampleTabButtonList";

class CodeExampleTabs extends React.Component {
  getChildren() {
    const { props } = this;

    return React.Children.map(props.children, tabElement => {
      const newTabProps = { activeTab: props.activeTab };

      if (tabElement.type === CodeExampleTabButtonList) {
        newTabProps.onChange = props.handleTabChange;
        newTabProps.vertical = props.vertical;
      }

      return React.cloneElement(tabElement, newTabProps);
    });
  }

  render() {
    const classes = classNames(
      "code-example-tabbed-container",
      this.props.className,
      {
        "code-example-tabbed-container-vertical": this.props.vertical
      }
    );

    return (
      <div className={classes}>
        {this.getChildren()}
      </div>
    );
  }
}

CodeExampleTabs.propTypes = {
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

module.exports = CodeExampleTabs;
