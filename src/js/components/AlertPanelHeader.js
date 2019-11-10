import PropTypes from "prop-types";
import React from "react";

const AlertPanelHeader = props => (
  <h2 className="flush-top">{props.children}</h2>
);

AlertPanelHeader.propTypes = {
  children: PropTypes.node
};

module.exports = AlertPanelHeader;
