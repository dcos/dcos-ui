import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";

import Panel from "./Panel";

class AlertPanel extends React.Component {
  // TODO: Use iconIDs instead of icon classes.
  getIcon() {
    const { icon, iconClassName } = this.props;

    if (icon) {
      return icon;
    }

    if (!iconClassName) {
      return null;
    }

    return <i className={iconClassName} key="icon" />;
  }

  render() {
    const classes = classNames(
      "panel alert-panel text-align-center flush-bottom",
      this.props.className
    );

    return (
      <Panel
        className={classes}
        contentClass={[
          "panel-cell-borderless panel-cell-wider panel-cell-taller",
          {
            "panel-cell-narrow": false,
            "panel-cell-short": false
          }
        ]}
        footer={this.props.footer}
        footerClass={[
          "panel-cell-wider panel-cell-taller",
          {
            "panel-cell-narrow": false,
            "panel-cell-short": false
          }
        ]}
        heading={this.getIcon()}
        headingClass={[
          "panel-cell-borderless flush-bottom",
          {
            "panel-cell-narrow": false,
            "panel-cell-shorter": false,
            "panel-cell-light": false
          }
        ]}
      >
        {this.props.children}
      </Panel>
    );
  }
}

AlertPanel.displayName = "AlertPanel";

AlertPanel.defaultProps = {
  icon: null
};

AlertPanel.propTypes = {
  icon: PropTypes.node,
  iconClassName: PropTypes.string
};

module.exports = AlertPanel;
