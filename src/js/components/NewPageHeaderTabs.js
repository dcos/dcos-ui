import classNames from 'classnames/dedupe';
import {Link} from 'react-router';
import React from 'react';

class PageHeaderTabs extends React.Component {
  render() {
    let {props: {tabs}} = this;

    let tabElements = tabs.map(function (tab, index) {
      let {isActive} = tab;
      let classes = classNames('tab-item', {active: isActive});
      let linkClasses = classNames('tab-item-label', {active: isActive});

      return (
        <li className={classes} key={index}>
          <Link className={linkClasses} to={tab.routePath}>
            <span className="tab-item-label-text">
              {tab.label}
            </span>
          </Link>
        </li>
      );
    });

    return (
      <ul className="menu-tabbed flush-bottom">
        {tabElements}
      </ul>
    );
  }
}

PageHeaderTabs.defaultProps = {
  tabs: []
};

PageHeaderTabs.propTypes = {
  tabs: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      isActive: React.PropTypes.bool,
      label: React.PropTypes.node.isRequired,
      routePath: React.PropTypes.string.isRequired
    })
  )
};

module.exports = PageHeaderTabs;
