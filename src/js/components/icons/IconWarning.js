import React from 'react';

module.exports = class IconWarning extends React.Component {
  render() {
    return (
      <svg
        className="icon icon-warning"
        height="64px"
        viewBox="0 0 64 64"
        width="64px"
        {...this.props}>
        <rect x="31" y="43" width="2" height="4"/>
        <rect x="31" y="17" width="2" height="22"/>
        <path d="M32,63A31,31,0,1,1,63,32,31,31,0,0,1,32,63ZM32,3A29,29,0,1,0,61,32,29,29,0,0,0,32,3Z"/>
      </svg>
    );
  }
}
