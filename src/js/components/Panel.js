import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";

const defaultClasses = {
  panel: "panel",
  content:
    "panel-content panel-cell panel-cell-narrow panel-cell-short panel-cell-borderless",
  footer:
    "panel-footer panel-cell panel-cell-narrow panel-cell-short flush-top",
  heading:
    "panel-header panel-cell panel-cell-light panel-cell-narrow panel-cell-shorter"
};

var Panel = React.createClass({
  displayName: "Panel",

  propTypes: {
    heading: PropTypes.node,
    footer: PropTypes.node,

    // classes
    contentClass: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
      PropTypes.string
    ]),
    headingClass: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
      PropTypes.string
    ]),
    footerClass: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
      PropTypes.string
    ]),
    onClick: PropTypes.func
  },

  getNode(nodeName) {
    const { props } = this;
    const node = props[nodeName];

    if (!node) {
      return null;
    }

    const classes = classNames(
      defaultClasses[nodeName],
      props[nodeName + "Class"]
    );

    return <div className={classes}>{node}</div>;
  },

  render() {
    const { props } = this;
    const contentClasses = classNames(
      defaultClasses.content,
      props.contentClass
    );
    const panelClasses = classNames(defaultClasses.panel, props.className);

    return (
      <div className={panelClasses} onClick={this.props.onClick}>
        {this.getNode("heading")}
        <div className={contentClasses}>{props.children}</div>
        {this.getNode("footer")}
      </div>
    );
  }
});

module.exports = Panel;
