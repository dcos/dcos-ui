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

  getProgressBar(data) {
    const { service } = this.props;
    const instancesCount = service.getInstancesCount();
    const tasksRunning = service.getTaskCount();

    if (tasksRunning === instancesCount) {
      return (
        <ProgressBar
          className="status-bar--large"
          data={data}
          total={instancesCount}
        />
      );
    }

    return (
      <Tooltip interactive={true} content={this.getTooltipContent()}>
        <ProgressBar
          className="status-bar--large"
          data={data}
          total={instancesCount}
        />
      </Tooltip>
    );
  }

  render() {
    const { service } = this.props;
    const instancesCount = service.getInstancesCount();
    const serviceStatus = service.getStatus();
    const tasksRunning = service.getTaskCount();

    if (instancesCount !== tasksRunning) {
      return this.getProgressBar([
        {
          state: "success",
          value: tasksRunning
        }
      ]);
    }

    if (serviceStatus === ServiceStatus.DELETING.displayName) {
      return this.getProgressBar([
        {
          state: "",
          value: 1
        }
      ]);
    }

    return null;
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
