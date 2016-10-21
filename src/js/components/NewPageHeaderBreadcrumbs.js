import {Dropdown} from 'reactjs-components';
import React from 'react';

import Icon from './Icon';

class PageHeaderBreadcrumbs extends React.Component {
  getBreadcrumbSubMenuItem(menuItem) {
    let {iconID, label, routePath} = menuItem;

    if (iconID) {
      return {
        className: 'hidden',
        id: 'default',
        selectedHtml: (
          <h3 className="flush">
            <Icon color="purple" family="small" id={iconID} size="small" />
            {label}
          </h3>
        ),
        routePath
      };
    }

    return {id: routePath, html: label, routePath};
  }

  getCaret(index) {
    return (
      <li className="page-header-breadcrumb-caret flush-top flush-left"
        key={`caret-${index}`}>
        <Icon color="light-grey" family="mini" id="caret-right" size="mini" />
      </li>
    );
  }

  getPrimaryBreadcrumb(breadcrumb) {
    let breadcrumbContent = null;

    if (breadcrumb.submenu) {
      let dropdownItems = breadcrumb.submenu.map(this.getBreadcrumbSubMenuItem);

      breadcrumbContent = (
        <Dropdown
          buttonClassName="button dropdown-toggle"
          dropdownMenuClassName="dropdown-menu"
          dropdownMenuListClassName="dropdown-menu-list"
          dropdownMenuListItemClassName="clickable"
          wrapperClassName="dropdown"
          items={dropdownItems}
          onItemSelection={this.handleBreadcrumbSubmenuItemSelect}
          persistentID="default"
          transition={true}
          transitionName="dropdown-menu" />
      );
    } else {
      breadcrumbContent = breadcrumb.label;
    }

    return (
      <li className="page-header-breadcrumb-primary h3 flush-top flush-left"
        key="primary-breadcrumb">
        {breadcrumbContent}
      </li>
    );
  }

  getSecondaryBreadcrumb(breadcrumb, index) {
    let {label = null, prefix = null, suffix = null} = breadcrumb;

    return (
      <li className="page-header-breadcrumb-secondary h3 flush-top flush-left"
        key={index}>
        {prefix}
        {label}
        {suffix}
      </li>
    );
  }

  handleBreadcrumbSubmenuItemSelect(menuItem) {
    console.log(menuItem);
  }

  render() {
    let {props: {breadcrumbs}} = this;

    let breadcrumbElements = breadcrumbs.reduce((memo, breadcrumb, index) => {
      if (index === 0) {
        memo.push(this.getPrimaryBreadcrumb(breadcrumb));
      } else {
        memo.push(this.getSecondaryBreadcrumb(breadcrumb, index));
      }

      if (index !== breadcrumbs.length - 1) {
        memo.push(this.getCaret(index));
      }

      return memo;
    }, []);

    return (
      <ul className="page-header-breadcrumbs list list-unstyled list-inline flush">
        {breadcrumbElements}
      </ul>
    );
  }
}

PageHeaderBreadcrumbs.propTypes = {
  breadcrumbs: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      iconID: React.PropTypes.string,
      label: React.PropTypes.node.isRequired,
      prefix: React.PropTypes.node,
      submenu: React.PropTypes.arrayOf(
        React.PropTypes.shape({
          iconID: React.PropTypes.string,
          label: React.PropTypes.node.isRequired,
          routePath: React.PropTypes.string.isRequired
        })
      ),
      suffix: React.PropTypes.node
    })
  ).isRequired
};

module.exports = PageHeaderBreadcrumbs;
