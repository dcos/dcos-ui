import PropTypes from "prop-types";
import React from "react";

const AlertPanelHeader = function(props) {
  return <h2 className="flush-top">{props.children}</h2>;
};

AlertPanelHeader.propTypes = {
  children: PropTypes.node
};

export default AlertPanelHeader;
