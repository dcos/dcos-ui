/* @flow */
import React from "react";

type Props = { children?: number | string | React.Element | Array<any> };

const AlertPanelHeader = function(props: Props) {
  return (
    <h3 className="flush-top">
      {props.children}
    </h3>
  );
};

module.exports = AlertPanelHeader;
