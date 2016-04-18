import React from 'react';

class IconNewWindow extends React.Component {
  render() {
    return (
      <svg
        className={this.props.className}
        height="13"
        viewBox="0 0 13 13"
        width="13"
        {...this.props}>
        <path d="M12 13V8h-1v4H1V2h4V1H0v12h12"/>
        <path d="M7 0v1h4.29l-5 5 .71.71 5-5V6h1V0H7"/>
      </svg>
    );
  }
}

IconNewWindow.defaultProps = {
  className: 'icon icon-new-window'
};

IconNewWindow.propTypes = {
  className: React.PropTypes.string
};

module.exports = IconNewWindow;
