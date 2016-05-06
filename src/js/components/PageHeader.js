import classNames from 'classnames/dedupe';
import React from 'react';

class PageHeader extends React.Component {

  getIcon() {
    let {icon, iconClassName} = this.props;

    if (icon == null) {
      return null;
    }

    let iconClasses = classNames(
      'icon icon-large icon-image-container',
      iconClassName
    );

    return (
      <div className="media-object-item">
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
      'flush inverse',
      titleClassName
    );

    return (
      <h1 className={titleClasses}>{title}</h1>
    );
  }

  getSubTitle() {
    let {subTitle} = this.props;

    if (subTitle == null) {
      return null;
    }

    return (<div className={this.props.subTitleClassName}>{subTitle}</div>);
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
      className,
      dividerClassName,
      mediaWrapperClassName,
      navigationTabs
    } = this.props;

    let classes = classNames(
      'container container-fluid container-pod container-pod-short',
      'flush flush-top',
      className
    );

    let dividerClasses = classNames(
      'container-pod container-pod-short flush-top',
      'container-pod-divider-bottom container-pod-divider-bottom-align-right',
      'container-pod-divider-inverse',
      dividerClassName
    );

    let mediaWrapperClasses = classNames(
      'media-object-spacing-wrapper media-object-spacing-narrow',
      'media-object-offset',
      mediaWrapperClassName
    );

    return (
      <div className={classes}>
        <div className={dividerClasses}>
          <div className={mediaWrapperClasses}>
            <div className="media-object flex-box flex-box-align-vertical-center page-header-container">
              <div className="page-header-container-left">
                {this.getIcon()}
                <div className="media-object-item">
                  {this.getTitle()}
                  {this.getSubTitle()}
                </div>
              </div>
              <div className="page-header-container-right">
                {this.renderActionButtons()}
              </div>
            </div>
          </div>
          {navigationTabs}
        </div>
      </div>
    );
  }
}

PageHeader.defaultProps = {
  actionButtons: [],
  className: 'container container-fluid container-pod container-pod-short flush flush-top',
  dividerClassName: 'container-pod container-pod-short flush-top flush-bottom container-pod-divider-bottom container-pod-divider-bottom-align-right container-pod-divider-inverse',
  iconClassName: 'icon icon-large icon-image-container icon-app-container',
  mediaWrapperClassName: 'media-object-spacing-wrapper media-object-spacing-narrow media-object-offset',
  subTitleClassName: 'emphasize',
  titleClassName: 'flush inverse'
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
  dividerClassName: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.object,
  ]),
  mediaWrapperClassName: React.PropTypes.oneOfType([
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
  subTitleClassName: React.PropTypes.string,
};

module.exports = PageHeader;
