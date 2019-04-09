import * as PropTypes from "prop-types";
import * as React from "react";
import { Tooltip } from "reactjs-components";

import ProgressBar from "#SRC/js/components/ProgressBar";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import * as ServiceStatus from "../constants/ServiceStatus";

const { Plural } = require("@lingui/macro");

interface ServiceStatusProgressBarProps {
  service: Service | ServiceTree | Pod;
}

class ServiceStatusProgressBar extends React.Component<
  ServiceStatusProgressBarProps
> {
  static propTypes = {
    service: PropTypes.oneOfType([
      PropTypes.instanceOf(Service),
      PropTypes.instanceOf(ServiceTree),
      PropTypes.instanceOf(Pod)
    ]).isRequired
  };

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
    const runningInstances = service.getRunningInstancesCount();

    if (!ServiceStatus.showProgressBar(service.getServiceStatus())) {
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

export default ServiceStatusProgressBar;
