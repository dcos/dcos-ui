import React from 'react';

class IconBack extends React.Component {
  render() {
    let {props} = this;
    let transform = '';
    let viewBox = '0 0 16 16';
    if (props.isForward) {
      transform = 'scale(-1,1)';
      viewBox = '-16 0 16 16';
    }

    return (
      <svg
        height="16px"
        viewBox={viewBox}
        width="16px"
        {...props}>
        <title>icon-back</title>
        <path transform={transform} d="M11.486.02L13 1.552 6.614 8.01 13 14.468 11.486 16l-7.9-7.99 7.9-7.99z" />
      </svg>
    );
  }
}

IconBack.defaultProps = {
  className: 'icon icon-back',
  isForward: false
};

IconBack.propTypes = {
  className: React.PropTypes.string,
  isForward: React.PropTypes.bool
};

module.exports = IconBack;
