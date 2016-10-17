import classNames from 'classnames/dedupe';
import React from 'react';

import TabButtons from './TabButtons';

class Tabs extends React.Component {
  constructor() {
    super();

    this.state = {
      activeTab: null
    };

    this.handleTabChange = this.handleTabChange.bind(this);
  }

  getChildren() {
    let {handleTabChange, props, state} = this;

    return React.Children.map(props.children, (tabElement) => {
      let newTabProps = {activeTab: state.activeTab};

      if (tabElement.type === TabButtons) {
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
