import React from 'react';

class IconChevron extends React.Component {
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
        viewBox={viewBox}
        {...props}>
        <title>icon-chevron</title>
        <path transform={transform} d="M11.486.02L13 1.552 6.614 8.01 13 14.468 11.486 16l-7.9-7.99 7.9-7.99z" />
      </svg>
    );
  }
}

IconChevron.defaultProps = {
  className: 'icon icon-back',
  isForward: true
};

IconChevron.propTypes = {
  className: React.PropTypes.string,
  isForward: React.PropTypes.bool
};

module.exports = IconChevron;
