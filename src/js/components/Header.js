import React from 'react';

class Header extends React.Component {

  getIcon(icon, className) {
    if (icon == null) {
      return null;
    }

    return (
      <div className="media-object-item">
        <div className={className}>
          {icon}
        </div>
      </div>
    );
  }

  getTitle(title, className) {
    if (title == null) {
      return null;
    }

    return (
      <h1 className={className}>
        {title}
      </h1>
    );
  }

  getSubTitle(subTitle) {
    if (subTitle == null) {
      return null;
    }

    return (<div>{subTitle}</div>);
  }

  render() {
    let props = this.props;

    return (
      <div className={props.className}>
        <div className={props.dividerClassName}>
          <div className={props.mediaWrapperClassName}>
            <div className="media-object flex-box flex-box-align-vertical-center">
              {this.getIcon(props.icon, props.iconClassName)}
              <div className="media-object-item">
                {this.getTitle(props.title, props.titleClassName)}
                {this.getSubTitle(props.subTitle)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Header.defaultProps = {
  className: 'container container-fluid container-pod container-pod-short flush flush-top',
  mediaWrapperClassName: 'media-object-spacing-wrapper media-object-spacing-narrow media-object-offset',
  dividerClassName: 'container-pod container-pod-short flush-top container-pod-divider-bottom container-pod-divider-bottom-align-right container-pod-divider-inverse',
  titleClassName: 'flush inverse',
  iconClassName: 'icon icon-large icon-image-container icon-app-container',
};

Header.propTypes = {
  icon: React.PropTypes.node,
  subTitle: React.PropTypes.node,
  title: React.PropTypes.string,

  className: React.PropTypes.string,
  dividerClassName: React.PropTypes.string,
  mediaWrapperClassName: React.PropTypes.string,
  titleClassName: React.PropTypes.string,
  iconClassName: React.PropTypes.string
};

module.exports = Header;
