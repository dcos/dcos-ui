import { Trans } from "@lingui/macro";
import { Link } from "react-router";
import PropTypes from "prop-types";
import React from "react";

import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";

const ServiceItemNotFound = function({ message }) {
  const footer = (
    <div className="button-collection flush-bottom">
      <Link to="/services" className="button button-primary">
        <Trans render="span">View Services</Trans>
      </Link>
    </div>
  );

  return (
    <AlertPanel>
      <AlertPanelHeader>
        <Trans render="span">Service not found</Trans>
      </AlertPanelHeader>
      <p className="tall">{message}</p>
      {footer}
    </AlertPanel>
  );
};

ServiceItemNotFound.defaultProps = {
  message: "Not Found."
};

ServiceItemNotFound.propTypes = {
  message: PropTypes.node
};

module.exports = ServiceItemNotFound;
