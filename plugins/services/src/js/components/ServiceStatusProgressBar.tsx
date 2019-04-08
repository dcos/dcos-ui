import * as PropTypes from "prop-types";
import * as React from "react";
import { Tooltip } from "reactjs-components";

import ProgressBar from "#SRC/js/components/ProgressBar";
import * as ServiceStatus from "../constants/ServiceStatus";

const { Plural } = require("@lingui/macro");

interface ServiceStatusProgressBarProps {
  runningInstances: number;
  instancesCount: number;
  serviceStatus: any;
}

export const ServiceProgressBar = React.memo(
  ({
    instancesCount,
    runningInstances
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
  static propTypes = {
    runningInstances: PropTypes.number.isRequired,
    instancesCount: PropTypes.number.isRequired,
    serviceStatus: PropTypes.object.isRequired
  };

  render() {
    const { instancesCount, serviceStatus, runningInstances } = this.props;

    if (!ServiceStatus.showProgressBar(serviceStatus)) {
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
