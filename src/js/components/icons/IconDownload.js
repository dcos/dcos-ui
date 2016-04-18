import React from 'react';

class IconDownload extends React.Component {
  render() {
    return (
      <svg
        className="icon icon-download"
        height="16px"
        viewBox="0 0 16 16"
        width="16px"
        {...this.props}>
        <polygon points="15.22 11.79 13.07 13.94 13.07 7.15 12.07 7.15 12.07 13.94 9.93 11.79 9.22 12.5 12.57 15.85 15.93 12.5 15.22 11.79"/>
        <path d="M3.07,4.15h7v1h-7v-1Zm0,3h7v1h-7v-1Zm0,3h5v1h-5v-1Zm10,5-13,0v-15h13v5h-1v-4h-11v13h7v1m5,0" fill-rule="evenodd"/>
      </svg>
    );
  }
}

module.exports = IconDownload;
