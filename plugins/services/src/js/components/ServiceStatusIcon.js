import React, { Component, PropTypes } from "react";

import StatusIcon from "#SRC/js/components//StatusIcon";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";

class ServiceStatusIcon extends Component {
  render() {
    const { service } = this.props;
    const displayName = service.getServiceStatus().displayName.toUpperCase();

    const iconState = displayName === "DEPLOYING" ||
      displayName === "RECOVERING" ||
      displayName === "DELETING"
      ? "TRANSITION"
      : displayName;

    return <StatusIcon state={iconState} />;
  }
}

ServiceStatusIcon.propTypes = {
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(Service),
    PropTypes.instanceOf(ServiceTree),
    PropTypes.instanceOf(Pod)
  ])
};

export default ServiceStatusIcon;
