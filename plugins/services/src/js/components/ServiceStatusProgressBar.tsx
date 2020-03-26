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

export const ServiceProgressBar = React.memo(
  ({
    instancesCount,
    runningInstances,
  }: {
    instancesCount: number;
    runningInstances: number;
  }) => (
    <Tooltip
      interactive={true}
      content={
        <div className="tooltip-line-item">
          <Plural
            render="span"
            value={runningInstances}
            one={`# instance running out of ${instancesCount}`}
            other={`# instances running out of ${instancesCount}`}
          />
        </div>
      }
    >
      <ProgressBar
        className="status-bar--large staged"
        data={ProgressBar.getDataFromValue(runningInstances, "success")}
        total={instancesCount}
      />
    </Tooltip>
  )
);

class ServiceStatusProgressBar extends React.Component<
  ServiceStatusProgressBarProps
> {
  public static propTypes = {
    service: PropTypes.oneOfType([
      PropTypes.instanceOf(Service),
      PropTypes.instanceOf(ServiceTree),
      PropTypes.instanceOf(Pod),
    ]).isRequired,
  };

  public render() {
    const { service } = this.props;
    const instancesCount = service.getInstancesCount();
    const runningInstances = service.getRunningInstancesCount();

    if (!ServiceStatus.showProgressBar(service.getServiceStatus())) {
      return null;
    }

    return (
      <ServiceProgressBar
        instancesCount={instancesCount}
        runningInstances={runningInstances}
      />
    );
  }
}

export default ServiceStatusProgressBar;
