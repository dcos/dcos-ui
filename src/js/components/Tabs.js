import classNames from 'classnames/dedupe';
import React from 'react';

import TabButtonList from './TabButtonList';

const METHODS_TO_BIND = ['handleTabChange'];

class Tabs extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      activeTab: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getChildren() {
    let {handleTabChange, props, state} = this;

    return React.Children.map(props.children, (tabElement) => {
      let newTabProps = {activeTab: state.activeTab};

      if (tabElement.type === TabButtonList) {
        newTabProps.onChange = handleTabChange;
        newTabProps.vertical = props.vertical;
      }

      return React.cloneElement(tabElement, newTabProps);
    });
  }

  handleTabChange(tabID) {
    this.setState({activeTab: tabID});
  }

  render() {
    let classes = classNames('menu-tabbed-container', {
      'menu-tabbed-container-vertical': this.props.vertical
    });

    return (
      <div className={classes}>
        {this.getChildren()}
      </div>
    );
  }
}

Tabs.propTypes = {
  children: React.PropTypes.node.isRequired,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  vertical: React.PropTypes.bool
};

module.exports = Tabs;
