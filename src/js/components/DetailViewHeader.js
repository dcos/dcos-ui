/* @flow */
import classNames from "classnames/dedupe";
import React from "react";

import CollapsingString from "./CollapsingString";

type Props = {
  actionButtons?: Array<React.Element>,
  icon?: number | string | React.Element | Array<any>,
  navigationTabs?: number | string | React.Element | Array<any>,
  subTitle?: number | string | React.Element | Array<any>,
  title?: string,
  className?: classPropType,
  detailViewHeaderClassNames?: classPropType,
  detailViewHeaderContentHeadingClassNames?: classPropType,
  detailViewHeaderContentWrapperClassNames?: classPropType,
  titleClassName?: classPropType,
  iconClassName?: classPropType,
  subTitleClassName?: classPropType
};

class DetailViewHeader extends React.Component {

  getIcon() {
    const { icon, iconClassName } = this.props;

    if (icon == null) {
      return null;
    }

    const iconClasses = classNames("icon icon-large", iconClassName);

    return (
      <div className="detail-view-header-icon">
        <div className={iconClasses}>
          {icon}
        </div>
      </div>
    );
  }

  getTitle() {
    const { title, titleClassName } = this.props;

    if (title == null) {
      return null;
    }

    const titleClasses = classNames("h1 flush", titleClassName);

    return (
      <span className={titleClasses}>
        <CollapsingString string={title} />
      </span>
    );
  }

  getSubTitle() {
    const { subTitle, subTitleClassName } = this.props;

    if (subTitle == null) {
      return null;
    }

    const subtitleClasses = classNames("emphasize", subTitleClassName);

    return <div className={subtitleClasses}>{subTitle}</div>;
  }

  renderActionButtons() {
    const { actionButtons, buttonCollectionClassNames } = this.props;
    const buttonCollectionClasses = classNames(
      "button-collection",
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
    const {
      children,
      className,
      detailViewHeaderContentWrapperClassNames,
      detailViewHeaderContentHeadingClassNames,
      navigationTabs
    } = this.props;

    const detailViewHeaderClasses = classNames(
      "detail-view-header flex-item-shrink-0",
      { "has-tabs": !!navigationTabs },
      className
    );

    const detailViewHeaderContentWrapperClasses = classNames(
      "detail-view-header-content-wrapper",
      detailViewHeaderContentWrapperClassNames
    );

    const detailViewHeaderContentHeadingClasses = classNames(
      "detail-view-header-content-heading",
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

module.exports = DetailViewHeader;
