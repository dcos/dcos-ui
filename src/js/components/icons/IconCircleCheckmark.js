import React from 'react';

class IconCircleCheckmark extends React.Component {
  render() {
    return (
      <svg
        height="64px"
        viewBox="0 0 64 64"
        width="64px"
        {...this.props}>
        <path d="M60.76,32a29,29,0,0,0-1.62-9.58l-1.89.66A27,27,0,1,1,48,10.46l1.21-1.59h0A29,29,0,1,0,60.76,32Z" fill-rule="evenodd"/>
        <polygon points="59.66 7.93 26.63 40.96 15.98 30.32 14.4 31.9 26.63 44.13 61.24 9.51 59.66 7.93"/>
      </svg>
    );
  }
}

IconCircleCheckmark.defaultProps = {
  className: 'icon icon-circle-checkmark'
};

IconCircleCheckmark.propTypes = {
  className: React.PropTypes.string
};

module.exports = IconCircleCheckmark;
