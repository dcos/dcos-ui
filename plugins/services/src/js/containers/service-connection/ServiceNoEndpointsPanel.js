import PropTypes from "prop-types";
import React from "react";
import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";

const ServiceNoEndpointPanel = props => {
  const { serviceId, onClick } = props;

  return (
    <AlertPanel>
      <AlertPanelHeader>No Endpoints</AlertPanelHeader>
      <p className="tall">
        There are no endpoints currently configured for {serviceId}. You can
        edit the configuration to add service endpoints.
      </p>
      <div className="button-collection flush-bottom">
        <button className="button-primary-link" onClick={onClick}>
          Edit Configuration
        </button>
      </div>
    </AlertPanel>
  );
};

ServiceNoEndpointPanel.propTypes = {
  onClick: PropTypes.func.isRequired,
  serviceId: PropTypes.string.isRequired
};

module.exports = ServiceNoEndpointPanel;
