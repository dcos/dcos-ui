import classNames from 'classnames/dedupe';
import React from 'react';

import NewPageHeaderActions from './NewPageHeaderActions';
import NewPageHeaderBreadcrumbs from './NewPageHeaderBreadcrumbs';
import NewPageHeaderTabs from './NewPageHeaderTabs';

class PageHeader extends React.Component {
  render() {
    let {
      props: {
        actions,
        breadcrumbs,
        className,
        innerClassName,
        primaryContentClassName,
        secondaryContentDetail,
        secondaryContentClassName,
        tabs
      }
    } = this;

    let classes = classNames('page-header', className);
    let innerClasses = classNames(
      'page-header-inner pod pod-short',
      innerClassName
    );
    let primaryContentClasses = classNames(
      'page-header-content-section',
      primaryContentClassName
    );
    let secondaryContentClasses = classNames(
      'page-header-content-section page-header-content-section-secondary',
      secondaryContentClassName
    );
    let secondaryContentDetailElement = null;

    if (secondaryContentDetail) {
      secondaryContentDetailElement = (
        <div className="page-header-content-section-secondary-detail">
          {secondaryContentDetail}
        </div>
      );
    }

    return (
      <div className={classes}>
        <div className={innerClasses}>
          <div className={primaryContentClasses}>
            <NewPageHeaderBreadcrumbs breadcrumbs={breadcrumbs} />
            <NewPageHeaderActions actions={actions} />
          </div>
          <div className={secondaryContentClasses}>
            <NewPageHeaderTabs tabs={tabs} />
            {secondaryContentDetailElement}
          </div>
        </div>
      </div>
    );
  }
}

const classProps = React.PropTypes.oneOfType([
  React.PropTypes.array,
  React.PropTypes.object,
  React.PropTypes.string
]);

PageHeader.defaultProps = {
  actions: [],
  tabs: []
};

PageHeader.propTypes = {
  actions: React.PropTypes.array,
  breadcrumbs: React.PropTypes.array.isRequired,
  className: classProps,
  innerClassName: classProps,
  primaryContentClassName: classProps,
  secondaryContentClassName: classProps,
  secondaryContentDetail: React.PropTypes.node,
  tabs: React.PropTypes.array
};

module.exports = PageHeader;
