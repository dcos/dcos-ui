import { Link } from "react-router";
import React, { PropTypes } from "react";

import AlertPanel from "../../../../../src/js/components/AlertPanel";
import AlertPanelHeader
  from "../../../../../src/js/components/AlertPanelHeader";

const ServiceItemNotFound = function({ message }) {
  const footer = (
    <div className="button-collection flush-bottom">
      <Link to="/services" className="button button-stroke">
        View Services
      </Link>
    </div>
  );

  return (
    <AlertPanel>
      <AlertPanelHeader>Service not found</AlertPanelHeader>
      <p className="tall">
        {message}
      </p>
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
