import React from "react";

const Banner = props => {
  return (
    <div className="message message-warning flush-bottom">{props.children}</div>
  );
};

module.exports = Banner;
