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
    let {props: {selectedTab, tabs}, state: {dropdownOpen}} = this;

    return tabs.map((tab, index) => {
      let {title} = tab;
      let classes = classNames(
        'sidebar-menu-item clickable visible-block',
        {
          'hidden-mini': !dropdownOpen,
          selected: title === selectedTab
        }
      );

      return (
        <li
          className={classes}
          key={index}
          onClick={this.handleTabClick.bind(this, title)}>
          <a>{title}</a>
        </li>
      );
    });
  }

  render() {
    let {className, selectedTab} = this.props;

    return (
      <ul className={className}>
        <li className="h3 sidebar-menu-item selection-header clickable visible-mini">
          <a onClick={this.handleTabClick.bind(this, selectedTab)}>
            {selectedTab}
            <span className="caret caret--desc caret--visible" />
          </a>
        </li>
        {this.getTabs()}
      </ul>
    );
  }
}

SideTabs.defaultProps = {
  className: 'sidebar-tabs list-unstyled',
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
