import classNames from 'classnames/dedupe';
import {Link} from 'react-router';
import React from 'react';

class PageHeaderTabs extends React.Component {
  render() {
    const {props: {tabs}} = this;

    let tabElements = tabs.map(function (tab, index) {
      let {isActive, callback} = tab;
      let classes = classNames('menu-tabbed-item', {active: isActive});
      let linkClasses = classNames('menu-tabbed-item-label', {active: isActive});

      let innerLinkSpan = (
        <span className="menu-tabbed-item-label-text">
          {tab.label}
        </span>
      );
      let link = (
        <a className={linkClasses} onClick={callback}>
          {innerLinkSpan}
        </a>
      );

      if (tab.callback == null) {
        link = (
          <Link className={linkClasses} to={tab.routePath} activeClassName="active">
            {innerLinkSpan}
          </Link>
        );
      }

      return (
        <li className={classes} key={index}>
          {link}
        </li>
      );
    });

    return (
      <div className="page-header-navigation">
        <ul className="menu-tabbed">
          {tabElements}
        </ul>
      </div>
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
      routePath: React.PropTypes.string,
      callback: React.PropTypes.func
    })
  )
};

module.exports = PageHeaderTabs;
