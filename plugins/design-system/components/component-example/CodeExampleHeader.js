import classNames from "classnames/dedupe";
import React, { Component } from "react";

const defaultClasses = {
  panel: "code-example-wrapper header",
  content: "code-example-header-content"
};

class CodeExampleHeader extends Component {
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

    return (
      <div className={classes}>
        {node}
      </div>
    );
  }

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
        <div className={contentClasses}>
          {props.children}
        </div>
        {this.getNode("footer")}
      </div>
    );
  }
}

CodeExampleHeader.propTypes = {
  heading: React.PropTypes.node,
  footer: React.PropTypes.node,

  contentClass: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  headingClass: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  footerClass: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),

  onClick: React.PropTypes.func
};

module.exports = CodeExampleHeader;
