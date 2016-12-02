import React from 'react';

import Icon from './Icon';

class PageHeaderBreadcrumbs extends React.Component {

  getCaret(index) {
    return (
      <li className="page-header-breadcrumb-caret flush-top flush-left"
        key={`caret-${index}`}>
        <Icon color="light-grey" id="caret-right" size="mini" />
      </li>
    );
  }

  render() {
    let {props: {iconID, breadcrumbs}} = this;

    const containerIcon = (
      <li className="page-header-breadcrumb-secondary h3 flush-top flush-left" key="-1">
        <Icon family="product" id={iconID} size="small" />
      </li>
    );

    let breadcrumbElements = breadcrumbs.reduce((memo, breadcrumb, index) => {
      memo.push(
        <li className="page-header-breadcrumb-secondary h3 flush-top flush-left" key={index}>
          {breadcrumb}
        </li>
      );

      if (index !== breadcrumbs.length - 1) {
        memo.push(this.getCaret(index));
      }

      return memo;
    }, [containerIcon]);

    return (
      <ul className="page-header-breadcrumbs list list-unstyled list-inline flush">
        {breadcrumbElements}
      </ul>
    );
  }
}

PageHeaderBreadcrumbs.propTypes = {
  iconID: React.PropTypes.string.isRequired,
  breadcrumbs: React.PropTypes.arrayOf(React.PropTypes.node).isRequired
};

module.exports = PageHeaderBreadcrumbs;
