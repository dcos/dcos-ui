import * as React from "react";

export default class IconOpenID extends React.Component {
  render() {
    return (
      <svg
        className="icon icon-openid"
        height="16"
        width="16"
        viewBox="0 0 16 16"
        {...this.props}
      >
        <g fill-rule="evenodd">
          <path
            d="M2.415 9.974c0 2.104 2.074 3.859 4.83 4.262V16C3.148 15.578 0 13.041 0 9.974 0 7.014 2.933 4.548 6.82 4v1.788C4.28 6.3 2.415 7.98 2.415 9.974zm11.952-4.348l1.24-.814.333 4.034-4.67-1.184 1.31-.86c-.698-.471-1.55-.823-2.497-1.014V4c1.65.232 3.13.81 4.284 1.625z"
            fill-opacity="0.4"
          />
          <path d="M7 1.279V16l3-1.232V0z" />
        </g>
      </svg>
    );
  }
}
