import classNames from 'classnames/dedupe';
import React from 'react';

import CollapsingString from './CollapsingString';

class PageHeader extends React.Component {

  getIcon() {
    let {icon, iconClassName} = this.props;

    if (icon == null) {
      return null;
    }

    let iconClasses = classNames('icon icon-large', iconClassName);

    return (
      <div className="page-header-icon">
        <div className={iconClasses}>
          {icon}
        </div>
      </div>
    );
  }

  getTitle() {
    let {title, titleClassName} = this.props;

    if (title == null) {
      return null;
    }

    let titleClasses = classNames(
      'h1 flush',
      titleClassName
    );

    return (
      <span className={titleClasses}>
        <CollapsingString string={title} />
      </span>
    );
  }

  getSubTitle() {
    let {subTitle, subTitleClassName} = this.props;

    if (subTitle == null) {
      return null;
    }

    let subtitleClasses = classNames(
      'emphasize',
      subTitleClassName
    );

    return (<div className={subtitleClasses}>{subTitle}</div>);
  }

  renderActionButtons() {
    let {actionButtons, buttonCollectionClassNames} = this.props;
    let buttonCollectionClasses = classNames(
      'button-collection',
      buttonCollectionClassNames
    );

    if (actionButtons.length === 0) {
      return null;
    }

    return (
      <div className={buttonCollectionClasses}>
        {actionButtons}
      </div>
    );
  }

  render() {
    let {
      children,
      className,
      pageHeaderContentWrapperClassNames,
      pageHeaderContentHeadingClassNames,
      navigationTabs
    } = this.props;

    let pageHeaderClasses = classNames(
      'page-header flex-no-shrink',
      {'has-tabs': !!navigationTabs},
      className
    );

    let pageHeaderContentWrapperClasses = classNames(
      'page-header-content-wrapper',
      pageHeaderContentWrapperClassNames
    );

    let pageHeaderContentHeadingClasses = classNames(
      'page-header-content-heading',
      pageHeaderContentHeadingClassNames
    );

    return (
      <div className={pageHeaderClasses}>
        <div className={pageHeaderContentWrapperClasses}>
          <div className={pageHeaderContentHeadingClasses}>
            <div className="page-header-content-primary">
              {this.getIcon()}
              <div className="page-header-title">
                {this.getTitle()}
              </div>
            </div>
            <div className="page-header-content-secondary">
              {this.renderActionButtons()}
            </div>
          </div>
          <div className="page-header-sub-heading">
            {this.getSubTitle()}
          </div>
        </div>
        {children}
        {navigationTabs}
      </div>
    );
  }
}

const classPropType = React.PropTypes.oneOfType([
  React.PropTypes.array,
  React.PropTypes.object,
  React.PropTypes.string
]);

PageHeader.defaultProps = {
  actionButtons: []
};

PageHeader.propTypes = {
  actionButtons: React.PropTypes.arrayOf(React.PropTypes.element),
  icon: React.PropTypes.node,
  navigationTabs: React.PropTypes.node,
  subTitle: React.PropTypes.node,
  title: React.PropTypes.string,

  className: classPropType,
  pageHeaderClassNames: classPropType,
  pageHeaderContentWrapperClassNames: classPropType,
  titleClassName: classPropType,
  iconClassName: classPropType,
  subTitleClassName: classPropType
};

module.exports = PageHeader;
