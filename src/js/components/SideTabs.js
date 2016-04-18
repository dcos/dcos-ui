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
    let props = this.props;
    if (props.isMobileWidth && title === props.selectedTab) {
      this.setState({dropdownOpen: !this.state.dropdownOpen});
    } else {
      props.onTabClick(title);
      this.setState({dropdownOpen: false});
    }
  }

  getTabHeader() {
    let {props} = this;
    let {isMobileWidth, selectedTab} = props;

    if (!isMobileWidth) {
      return null;
    }

    let caret = (
      <span className="caret caret--desc caret--visible" />
    );

    return (
      <li className="h3 sidebar-menu-item selected clickable">
        <a onClick={this.handleTabClick.bind(this, selectedTab)}>
          {selectedTab}
          {caret}
        </a>
      </li>
    );
  }

  getTabs() {
    let {props, state} = this;
    let {isMobileWidth, selectedTab} = props;

    return props.tabs.map((tab, i) => {
      let title = tab.title;
      let classes = classNames('sidebar-menu-item', 'clickable', {
        h3: isMobileWidth,
        hidden: !state.dropdownOpen && isMobileWidth,
        selected: title === selectedTab && !isMobileWidth
      });

      return (
        <li
          className={classes}
          key={i}
          onClick={this.handleTabClick.bind(this, title)}>
          <a>
            {title}
          </a>
        </li>
      );
    });
  }

  render() {
    return (
      <ul className={this.props.className}>
        {this.getTabHeader()}
        {this.getTabs()}
      </ul>
    );
  }
}

SideTabs.defaultProps = {
  className: 'sidebar-tabs list-unstyled',
  isMobileWidth: false,
  onTabClick: function () {},
  tabs: []
};

SideTabs.propTypes = {
  className: React.PropTypes.string,
  isMobileWidth: React.PropTypes.bool,
  onTabClick: React.PropTypes.func,
  selectedTab: React.PropTypes.string,
  tabs: React.PropTypes.array
};

module.exports = SideTabs;
