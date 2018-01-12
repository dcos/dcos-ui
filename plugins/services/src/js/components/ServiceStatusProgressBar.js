import React, { PropTypes } from "react";
import { Tooltip } from "reactjs-components";

import StringUtil from "#SRC/js/utils/StringUtil";
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
        <span>
          {`${runningInstances} ${StringUtil.pluralize("instance", runningInstances)} running out of ${instancesTotal}`}
        </span>
      </div>
    );
  }

  render() {
    const { service } = this.props;
    const instancesCount = service.getInstancesCount();
    const serviceStatus = service.getServiceStatus();
    let runningInstances = service.getRunningInstancesCount();

    if (
      serviceStatus === ServiceStatus.RUNNING ||
      serviceStatus === ServiceStatus.STOPPED ||
      serviceStatus === ServiceStatus.NA
    ) {
      return null;
    }

    if (
      serviceStatus === ServiceStatus.DEPLOYING ||
      serviceStatus === ServiceStatus.DELETING
    ) {
      runningInstances = 0;
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
