import classNames from 'classnames/dedupe';
import React from 'react';

const defaultClasses = {
  panel: 'panel',
  content: 'panel-content panel-cell panel-cell-narrow panel-cell-short panel-cell-borderless',
  footer: 'panel-footer panel-cell panel-cell-narrow panel-cell-short flush-top',
  heading: 'panel-header panel-cell panel-cell-light panel-cell-narrow panel-cell-shorter'
};

var Panel = React.createClass({

  displayName: 'Panel',

  propTypes: {
    heading: React.PropTypes.node,
    footer: React.PropTypes.node,

    // classes
    contentClass: React.PropTypes.string,
    headingClass: React.PropTypes.string,
    footerClass: React.PropTypes.string,
    onClick: React.PropTypes.func
  },

  getNode(nodeName) {
    let {props} = this;
    let node = props[nodeName];

    if (!node) {
      return null;
    }

    let classes = classNames(
      defaultClasses[nodeName],
      props[nodeName + 'Class']
    );

    return (
      <div className={classes}>
        {node}
      </div>
    );
  },

  render() {
    let {props} = this;
    let contentClasses = classNames(defaultClasses.content, props.contentClass);
    let panelClasses = classNames(defaultClasses.panel, props.className);

    return (
      <div className={panelClasses} onClick={this.props.onClick}>
        {this.getNode('heading')}
        <div className={contentClasses}>
          {props.children}
        </div>
        {this.getNode('footer')}
      </div>
    );
  }
});

module.exports = Panel;
