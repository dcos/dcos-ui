import PropTypes from "prop-types";
import React from "react";
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
    const tasksRunning = service.getTaskCount();
    const instancesTotal = service.getInstancesCount();

    return (
      <div className="tooltip-line-item">
        <span>
          {`${tasksRunning} ${StringUtil.pluralize("instance", tasksRunning)} running out of ${instancesTotal}`}
        </span>
      </div>
    );
  }

  render() {
    const { service } = this.props;
    const instancesCount = service.getInstancesCount();
    const serviceStatus = service.getServiceStatus();
    let tasksRunning = service.getTaskCount();

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
      tasksRunning = 0;
    }

    return (
      <Tooltip interactive={true} content={this.getTooltipContent()}>
        <ProgressBar
          className="status-bar--large staged"
          data={[
            {
              className: "success",
              value: tasksRunning
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
