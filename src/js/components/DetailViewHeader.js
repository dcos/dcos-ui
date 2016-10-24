import classNames from 'classnames/dedupe';
import React from 'react';

import CollapsingString from './CollapsingString';

class DetailViewHeader extends React.Component {

  getIcon() {
    let {icon, iconClassName} = this.props;

    if (icon == null) {
      return null;
    }

    let iconClasses = classNames('icon icon-large', iconClassName);

    return (
      <div className="detail-view-header-icon">
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
      detailViewHeaderContentWrapperClassNames,
      detailViewHeaderContentHeadingClassNames,
      navigationTabs
    } = this.props;

    let detailViewHeaderClasses = classNames(
      'detail-view-header flex-item-shrink-0',
      {'has-tabs': !!navigationTabs},
      className
    );

    let detailViewHeaderContentWrapperClasses = classNames(
      'detail-view-header-content-wrapper',
      detailViewHeaderContentWrapperClassNames
    );

    let detailViewHeaderContentHeadingClasses = classNames(
      'detail-view-header-content-heading',
      detailViewHeaderContentHeadingClassNames
    );

    return (
      <div className={detailViewHeaderClasses}>
        <div className={detailViewHeaderContentWrapperClasses}>
          <div className={detailViewHeaderContentHeadingClasses}>
            <div className="detail-view-header-content-primary">
              {this.getIcon()}
              <div className="detail-view-header-title">
                {this.getTitle()}
              </div>
            </div>
            <div className="detail-view-header-content-secondary">
              {this.renderActionButtons()}
            </div>
          </div>
          <div className="detail-view-header-sub-heading">
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

DetailViewHeader.defaultProps = {
  actionButtons: []
};

DetailViewHeader.propTypes = {
  actionButtons: React.PropTypes.arrayOf(React.PropTypes.element),
  icon: React.PropTypes.node,
  navigationTabs: React.PropTypes.node,
  subTitle: React.PropTypes.node,
  title: React.PropTypes.string,

  className: classPropType,
  detailViewHeaderClassNames: classPropType,
  detailViewHeaderContentHeadingClassNames: classPropType,
  detailViewHeaderContentWrapperClassNames: classPropType,
  titleClassName: classPropType,
  iconClassName: classPropType,
  subTitleClassName: classPropType
};

module.exports = DetailViewHeader;
