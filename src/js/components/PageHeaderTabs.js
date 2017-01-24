import classNames from 'classnames';
import {Dropdown} from 'reactjs-components';
import {Link, routerShape} from 'react-router';
import React from 'react';

import Icon from './Icon';

const METHODS_TO_BIND = ['handleNavigationItemSelection'];

class PageHeaderTabs extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getTabs() {
    const {props: {tabs}} = this;

    const tabElements = tabs.map(function (tab, index) {
      const {isActive, callback, label, routePath} = tab;
      const classes = classNames('menu-tabbed-item', {active: isActive});
      const linkClasses = classNames('menu-tabbed-item-label', {active: isActive});

      const innerLinkSpan = (
        <span className="menu-tabbed-item-label-text">
          {label}
        </span>
      );
      let link = (
        <a className={linkClasses} onClick={callback}>
          {innerLinkSpan}
        </a>
      );

      if (callback == null) {
        link = (
          <Link
            className={linkClasses}
            to={routePath}
            activeClassName="active">
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
      <ul className="page-header-navigation-tabs menu-tabbed">
        {tabElements}
      </ul>
    );
  }

  getDropdown() {
    let activeID = null;
    const {props: {tabs}} = this;

    if (!tabs || tabs.length === 0) {
      return null;
    }

    const dropdownItems = tabs.map((tab, index) => {
      const {callback, isActive, label, routePath} = tab;
      // We add 1 to index for the ID to avoid an ID of 0, due to coercion in
      // the Dropdown component.
      const id = index + 1;

      if (isActive || (routePath != null && this.isRouteActive(routePath))) {
        activeID = id;
      }

      return {
        html: label,
        id,
        callback,
        routePath,
        selectedHtml: (
          <div className="page-header-navigation-dropdown-active-item">
            <span className="page-header-navigation-dropdown-label">
              {label}
            </span>
            <span className="page-header-navigation-dropdown-caret">
              <Icon id="caret-down"
                color="light-grey"
                family="tiny"
                size="tiny" />
            </span>
          </div>
        )
      };
    });

    return (
      <Dropdown
        buttonClassName="page-header-navigation-dropdown-button button button-transparent"
        dropdownMenuClassName="page-header-navigation-dropdown-menu dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        items={dropdownItems}
        onItemSelection={this.handleNavigationItemSelection}
        persistentID={activeID}
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        transition={true}
        transitionName="dropdown-menu"
        wrapperClassName="page-header-navigation-dropdown dropdown" />
    );
  }

  handleNavigationItemSelection({callback, routePath}) {
    if (callback != null) {
      callback();
    }

    if (routePath != null) {
      this.context.router.push(routePath);
    }
  }

  isRouteActive(route) {
    return this.context.router.isActive(route);
  }

  render() {
    return (
      <div className="page-header-navigation">
        {this.getTabs()}
        {this.getDropdown()}
      </div>
    );
  }
}

PageHeaderTabs.contextTypes = {
  router: routerShape
};

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
