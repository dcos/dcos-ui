import PropTypes from "prop-types";
import React from "react";
import { Trans } from "@lingui/macro";
import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";

const ServiceNoEndpointPanel = props => {
  const { serviceId, onClick } = props;

  return (
    <AlertPanel>
      <Trans render={<AlertPanelHeader />}>No Endpoints</Trans>
      <Trans render="p" className="tall">
        There are no endpoints currently configured for {serviceId}. You can
        edit the configuration to add service endpoints.
      </Trans>
      <div className="button-collection flush-bottom">
        <Trans
          render={<button className="button-primary-link" onClick={onClick} />}
        >
          Edit Configuration
        </Trans>
      </div>
    </AlertPanel>
  );
};

ServiceNoEndpointPanel.propTypes = {
  onClick: PropTypes.func.isRequired,
  serviceId: PropTypes.string.isRequired
};

module.exports = ServiceNoEndpointPanel;
