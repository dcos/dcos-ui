import classNames from 'classnames/dedupe';
import React from 'react';

class TabButtonList extends React.Component {
  getChildren() {
    let {activeTab, children, onChange} = this.props;

    return React.Children.map(children, (tab, index) => {
      let tabProps = {activeTab, onClick: onChange};

      if (tab.props.id === activeTab || (!activeTab && index === 0)) {
        tabProps.active = true;
      }

      return React.cloneElement(tab, tabProps);
    });
  }

  render() {
    let {className, vertical} = this.props;
    let classes = classNames(
      'menu-tabbed',
      {
        'menu-tabbed-vertical': vertical
      },
      className
    );

    return (
      <div className={classes}>
        {this.getChildren()}
      </div>
    );
  }
}

TabButtonList.propTypes = {
  activeTab: React.PropTypes.string,
  children: React.PropTypes.node,
  className: React.PropTypes.oneOf([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  onChange: React.PropTypes.func,
  vertical: React.PropTypes.bool
};

module.exports = TabButtonList;
