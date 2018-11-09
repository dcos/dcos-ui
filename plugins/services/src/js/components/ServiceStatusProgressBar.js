import PropTypes from "prop-types";
import React from "react";
import { Tooltip } from "reactjs-components";
/* eslint-disable no-unused-vars */
import { Trans, Plural } from "@lingui/macro";
/* eslint-enable no-unused-vars */

import ProgressBar from "#SRC/js/components/ProgressBar";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import ServiceStatus from "../constants/ServiceStatus";

class ServiceStatusProgressBar extends React.Component {
  getTooltipContent() {
    const { service } = this.props;
    const runningInstances = service.getRunningInstancesCount();
    const instancesTotal = service.getInstancesCount();

    return (
      <div className="tooltip-line-item">
        <Plural
          render="span"
          value={runningInstances}
          one={`# instance running out of ${instancesTotal}`}
          other={`# instances running out of ${instancesTotal}`}
        />
      </div>
    );
  }

  render() {
    const { service } = this.props;
    const instancesCount = service.getInstancesCount();
    const serviceStatus = service.getServiceStatus();
    const runningInstances = service.getRunningInstancesCount();

    if (
      serviceStatus === ServiceStatus.RUNNING ||
      serviceStatus === ServiceStatus.STOPPED ||
      serviceStatus === ServiceStatus.NA
    ) {
      return null;
    }

    return (
      <Tooltip interactive={true} content={this.getTooltipContent()}>
        <ProgressBar
          className="status-bar--large staged"
          data={[
            {
              className: "success",
              value: runningInstances
            }
          ]}
          total={instancesCount}
        />
      </Tooltip>
    );
  }
}

ServiceStatusProgressBar.propTypes = {
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(Service),
    PropTypes.instanceOf(ServiceTree),
    PropTypes.instanceOf(Pod)
  ]).isRequired
};

module.exports = ServiceStatusProgressBar;
