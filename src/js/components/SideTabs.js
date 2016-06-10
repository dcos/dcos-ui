import classNames from 'classnames';
import React from 'react';

class SideTabs extends React.Component {
  constructor() {
    super();

    this.state = {
      dropdownOpen: false
    };
  }

  handleTabClick(title) {
    let {state: {dropdownOpen}, props: {onTabClick, selectedTab}} = this;

    if (title === selectedTab) {
      this.setState({dropdownOpen: !dropdownOpen});
    } else {
      this.setState({dropdownOpen: false});
    }
    // Trigger on both open and close to make sure to trigger gemini update
    onTabClick(title);
  }

  getTabs() {
    let {selectedTab, tabs} = this.props;

    return tabs.map((tab, index) => {
      let {title, selectValue} = tab;
      let classes = classNames('sidebar-menu-item clickable visible-block', {
        selected: selectValue === selectedTab || title === selectedTab
      });

      return (
        <li
          className={classes}
          key={index}
          onClick={this.handleTabClick.bind(this, selectValue)}>
          <a>{title}</a>
        </li>
      );
    });
  }

  render() {
    let {props: {className, selectedTab}, state: {dropdownOpen}} = this;

    let classes = classNames('list-unstyled visible-block', {
      'hidden-mini': !dropdownOpen
    });
    let caretClasses = classNames('caret caret--desc caret--visible', {
      'dropup': dropdownOpen
    })

    return (
      <div className={className}>
        <span className="sidebar-menu-item selection-header clickable visible-mini" onClick={this.handleTabClick.bind(this, selectedTab)}>
          <a>
            {selectedTab}
            <span className={caretClasses} />
          </a>
        </span>
        <ul className={classes}>
          {this.getTabs()}
        </ul>
      </div>
    );
  }
}

SideTabs.defaultProps = {
  className: 'sidebar-tabs',
  onTabClick: function () {},
  tabs: []
};

SideTabs.propTypes = {
  className: React.PropTypes.string,
  onTabClick: React.PropTypes.func,
  selectedTab: React.PropTypes.string,
  tabs: React.PropTypes.array
};

module.exports = SideTabs;
