import React from "react";

const AlertPanelHeader = function(props) {
  return (
    <h2 className="flush-top">
      {props.children}
    </h2>
  );
};

AlertPanelHeader.propTypes = {
  children: React.PropTypes.node
};

module.exports = AlertPanelHeader;
