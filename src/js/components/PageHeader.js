import classNames from 'classnames';
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

    return (<div>{subTitle}</div>);
  }

  render() {
    let {
      actionButtons,
      children,
      className,
      dividerClassName,
      mediaWrapperClassName
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
                {actionButtons}
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
    );
  }
}

PageHeader.propTypes = {
  actionButtons: React.PropTypes.element,
  icon: React.PropTypes.node,
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
  ])
};

module.exports = PageHeader;
