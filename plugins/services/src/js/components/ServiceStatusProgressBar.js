import React, { PropTypes } from "react";

import ProgressBar from "#SRC/js/components/ProgressBar";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";

class ServiceStatusProgressBar extends React.Component {
  render() {
    const { service } = this.props;
    const instancesCount = service.getInstancesCount();
    const tasksRunning = service.getTaskCount();

    if (instancesCount === tasksRunning) {
      return null;
    }

    return (
      <ProgressBar
        className="status-bar--large"
        data={[
          {
            state: "success",
            value: tasksRunning
          }
        ]}
        total={instancesCount}
      />
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
