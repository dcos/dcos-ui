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
    const { tasksRunning } = service.getTasksSummary();
    const instancesTotal = service.getInstancesCount();

    return (
      <div className="tooltip-line-item">
        <span>
          {`${tasksRunning} ${StringUtil.pluralize("instance", tasksRunning)} running out of ${instancesTotal} `}
        </span>
      </div>
    );
  }

  render() {
    const { service } = this.props;
    const instancesCount = service.getInstancesCount();
    const serviceStatus = service.getStatus();
    const tasksRunning = service.getTaskCount();

    if (
      serviceStatus === ServiceStatus.RUNNING.displayName ||
      serviceStatus === ServiceStatus.STOPPED.displayName
    ) {
      return null;
    } else if (serviceStatus === ServiceStatus.DELETING.displayName) {
      return (
        <ProgressBar
          className="status-bar--large"
          data={[
            {
              state: "staged",
              value: instancesCount
            }
          ]}
          total={instancesCount}
        />
      );
    }

    return (
      <Tooltip interactive={true} content={this.getTooltipContent()}>
        <ProgressBar
          className="status-bar--large"
          data={[
            {
              state: "success",
              value: tasksRunning
            },
            {
              state: "staged",
              value: instancesCount
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
  ])
};

module.exports = ServiceStatusProgressBar;
