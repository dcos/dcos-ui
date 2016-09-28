import classNames from 'classnames/dedupe';
import React from 'react';

import Panel from './Panel';

var AlertPanel = React.createClass({

  displayName: 'AlertPanel',

  defaultProps: {
    icon: null
  },

  propTypes: {
    title: React.PropTypes.string,
    icon: React.PropTypes.node,
    iconClassName: React.PropTypes.string
  },

  getHeading() {
    return (
      <div>
        {this.getIcon()}
        {this.getTitle()}
      </div>
    );
  },

  getTitle() {
    return (
      <h3 className="flush" key="heading">
        {this.props.title}
      </h3>
    );
  },

  // TODO: Use iconIDs instead of icon classes.
  getIcon() {
    let {icon, iconClassName} = this.props;

    if (!!icon) {
      return icon;
    }

    if (!iconClassName) {
      return null;
    }

    return (
      <i className={iconClassName} key="icon"></i>
    );
  },

  render() {
    let classes = classNames(
      'panel alert-panel text-align-center flush-bottom',
      this.props.className
    );

    return (
      <Panel ref="panel"
        className={classes}
        contentClass={{
          'panel-cell-narrow': false,
          'panel-cell-short': false
        }}
        footer={this.props.footer}
        footerClass={{
          'panel-cell-narrow': false,
          'panel-cell-short': false
        }}
        heading={this.getHeading()}
        headingClass={[
          'panel-cell-borderless flush-bottom',
          {
            'panel-cell-narrow': false,
            'panel-cell-shorter': false,
            'panel-cell-light': false
          }
        ]}>
        {this.props.children}
      </Panel>
    );
  }
});

module.exports = AlertPanel;
