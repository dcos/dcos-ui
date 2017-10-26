import React, { Component, PropTypes } from "react";
import { Tooltip } from "reactjs-components";

import StatusIcon from "#SRC/js/components//StatusIcon";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import DeclinedOffersUtil from "../utils/DeclinedOffersUtil";

class ServiceStatusIcon extends Component {
  getTooltipContent() {
    const { service } = this.props;
    const serviceDebugPath = encodeURIComponent(service.getId());

    return (
      <div className="tooltip-line-item">
        <span>
          Waiting for resources to continue.
          {" "}
          <a href={`#/services/detail/${serviceDebugPath}/debug`}>
            Debug information
          </a>.
        </span>
      </div>
    );
  }

  render() {
    const { service } = this.props;
    const displayName = service.getServiceStatus().displayName.toUpperCase();
    let iconState = displayName;

    if (
      displayName === "DEPLOYING" ||
      displayName === "RECOVERING" ||
      displayName === "DELETING"
    ) {
      iconState = "TRANSITION";
    }

    if (DeclinedOffersUtil.shouldDisplayDeclinedOffersWarning(service)) {
      return (
        <Tooltip interactive={true} content={this.getTooltipContent()}>
          <StatusIcon state="WARNING" />
        </Tooltip>
      );
    }

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
