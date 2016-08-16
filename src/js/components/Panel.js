import React from 'react';

var Panel = React.createClass({

  displayName: 'Panel',

  propTypes: {
    heading: React.PropTypes.node,
    footer: React.PropTypes.node,

    // classes
    contentClass: React.PropTypes.string,
    headingClass: React.PropTypes.string,
    footerClass: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      className: 'panel',
      contentClass: 'panel-content',
      footerClass: 'panel-footer',
      headingClass: 'panel-header'
    };
  },

  getNode(nodeName) {
    let {props} = this;
    let node = props[nodeName];
    if (!node) {
      return null;
    }

    return (
      <div className={props[nodeName + 'Class']}>
        {node}
      </div>
    );
  },

  render() {
    let {props} = this;

    return (
      <div {...props}>
        {this.getNode('heading')}
        <div className={props.contentClass}>
          {props.children}
        </div>
        {this.getNode('footer')}
      </div>
    );
  }
});

module.exports = Panel;
