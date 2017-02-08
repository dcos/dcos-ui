import {Link} from 'react-router';
import React from 'react';
import {Tooltip} from 'reactjs-components';

import Icon from './Icon';

class PageHeaderBreadcrumbs extends React.Component {
  getCaret(key) {
    return (
      <li className="page-header-breadcrumb page-header-breadcrumb-caret"
        key={`caret-${key}`}>
        <Icon color="light-grey" id="caret-right" size="mini" />
      </li>
    );
  }

  render() {
    const {props: {breadcrumbs, iconID, iconRoute}} = this;
    const breadcrumbCount = breadcrumbs.length;
    const containerIcon = (
      <li
        className="page-header-breadcrumb page-header-breadcrumb-icon"
        key="-1">
        <Link to={iconRoute}>
          <Icon family="product" id={iconID} size="small" />
        </Link>
      </li>
    );
    const shouldTruncateBreadcrumbs = breadcrumbCount > 3;

    const breadcrumbElements = breadcrumbs.reduce((memo, breadcrumb, index) => {
      if (shouldTruncateBreadcrumbs && index === breadcrumbCount - 3) {
        memo.push(
          this.getCaret('first-caret'),
          (
            <Tooltip
              content={breadcrumb.props.title}
              key="breadcrumb-ellipsis"
              wrapperClassName="page-header-breadcrumb page-header-breadcrumb--force-ellipsis h3">
              {breadcrumb}
            </Tooltip>
          ),
          this.getCaret(index)
        );
      }

      if (shouldTruncateBreadcrumbs && index < breadcrumbCount - 2) {
        return memo;
      }

      memo.push(
        <li className="page-header-breadcrumb h3" key={index}>
          {breadcrumb}
        </li>
      );

      if (index !== breadcrumbs.length - 1) {
        memo.push(this.getCaret(index));
      }

      return memo;
    }, [containerIcon]);

    return (
      <ul className="page-header-breadcrumbs">
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
