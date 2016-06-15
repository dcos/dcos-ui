import classNames from 'classnames/dedupe';
import React from 'react';

class PageHeader extends React.Component {

  getIcon() {
    let {icon, iconClassName} = this.props;

    if (icon == null) {
      return null;
    }

    let iconClasses = classNames(
      'icon icon-image-container',
      iconClassName
    );

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
      'flush-top inverse',
      titleClassName
    );

    return (
      <h1 className={titleClasses}>{title}</h1>
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
    let {actionButtons} = this.props;

    if (actionButtons.length === 0) {
      return null;
    }

    return (
      <div className="button-collection">
        {actionButtons}
      </div>
    );
  }

  render() {
    let {
      children,
      className,
      pageHeaderHeadingClassNames,
      navigationTabs
    } = this.props;

    let pageHeaderClasses = classNames(
      'page-header flex-no-shrink',
      {'has-tabs': !!navigationTabs},
      className
    );

    let pageHeaderHeadingClasses = classNames(
      'page-header-heading',
      pageHeaderHeadingClassNames
    );

    return (
      <div className={pageHeaderClasses}>
        <div className={pageHeaderHeadingClasses}>
          <div className="page-header-content">
            {this.getIcon()}
            <div className="page-header-text">
              {this.getTitle()}
              {this.getSubTitle()}
            </div>
          </div>
          <div className="page-header-actions">
            {this.renderActionButtons()}
          </div>
        </div>
        {children}
        {navigationTabs}
      </div>
    );
  }
}

PageHeader.defaultProps = {
  actionButtons: []
};

PageHeader.propTypes = {
  actionButtons: React.PropTypes.arrayOf(React.PropTypes.element),
  icon: React.PropTypes.node,
  navigationTabs: React.PropTypes.node,
  subTitle: React.PropTypes.node,
  title: React.PropTypes.string,

  className: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.object,
  ]),
  pageHeaderClassNames: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.object,
  ]),
  pageHeaderHeadingClassNames: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.object,
  ]),
  titleClassName: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.object,
  ]),
  iconClassName: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.object,
  ]),
  subTitleClassName: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.object,
  ])
};

module.exports = PageHeader;
