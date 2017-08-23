/* @flow */
import { Link } from "react-router";
import React, { PropTypes } from "react";

import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";

type Props = { message?: number | string | React.Element | Array<any> };

const ServiceItemNotFound = function(props: Props) {
  const { message } = props;
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

module.exports = ServiceItemNotFound;
