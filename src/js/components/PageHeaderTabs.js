import classNames from "classnames";
import { Link, routerShape } from "react-router";
import PropTypes from "prop-types";
import React from "react";
import { Trans } from "@lingui/macro";

import PageHeaderNavigationDropdown from "./PageHeaderNavigationDropdown";

const METHODS_TO_BIND = ["handleNavigationItemSelection"];

class PageHeaderTabs extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleNavigationItemSelection(navItem) {
    const { callback, routePath } = navItem;

    if (callback != null) {
      callback();
    }

    if (routePath != null) {
      this.context.router.push(routePath);
    }
  }

  getTabs() {
    const {
      props: { tabs }
    } = this;

    const tabElements = tabs.map(function(tab, index) {
      const { isActive, callback, label, routePath } = tab;
      const classes = classNames("menu-tabbed-item", { active: isActive });
      const linkClasses = classNames("menu-tabbed-item-label", {
        active: isActive
      });

      const innerLinkSpan = (
        <Trans
          id={label}
          className="menu-tabbed-item-label-text"
          render="span"
        />
      );
      let link = (
        <a className={linkClasses} onClick={callback}>
          {innerLinkSpan}
        </a>
      );

      if (callback == null && routePath != null) {
        link = (
          <Link className={linkClasses} to={routePath} activeClassName="active">
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
      <ul className="page-header-navigation-tabs menu-tabbed">{tabElements}</ul>
    );
  }

  getNavigationDropdownItems() {
    const { tabs } = this.props;

    if (tabs == null) {
      return [];
    }

    return tabs.map((tab, index) => {
      const { callback, isActive, label, routePath } = tab;
      // We add 1 to index for the ID to avoid an ID of 0, due to coercion in
      // the Dropdown component.
      const id = index + 1;

      return {
        label,
        id,
        isActive: isActive || this.isRouteActive(routePath),
        callback,
        routePath
      };
    });
  }

  isRouteActive(route) {
    return route != null && this.context.router.isActive(route);
  }

  render() {
    return (
      <div className="page-header-navigation">
        {this.getTabs()}
        <PageHeaderNavigationDropdown
          handleNavigationItemSelection={this.handleNavigationItemSelection}
          items={this.getNavigationDropdownItems()}
        />
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
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      isActive: PropTypes.bool,
      label: PropTypes.node.isRequired,
      routePath: PropTypes.string,
      callback: PropTypes.func
    })
  )
};

export default PageHeaderTabs;
