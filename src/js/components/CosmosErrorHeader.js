/* @flow */
import React from "react";

type Props = { children?: number | string | React.Element | Array<any> };

const CosmosErrorHeader = function(props: Props) {
  return (
    <h3 className="text-align-center flush-top">
      {props.children}
    </h3>
  );
};

module.exports = CosmosErrorHeader;
