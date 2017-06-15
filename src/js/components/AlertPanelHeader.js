import React from "react";

const AlertPanelHeader = function(props) {
  return (
    <h3 className="flush-top">
      {props.children}
    </h3>
  );
};

AlertPanelHeader.propTypes = {
  children: React.PropTypes.node
};

module.exports = AlertPanelHeader;
