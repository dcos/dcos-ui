import * as React from "react";
import { Trans } from "@lingui/macro";
import { TextCell } from "@dcos/ui-kit";

import StringUtil from "#SRC/js/utils/StringUtil";
import { SortDirection } from "#PLUGINS/services/src/js/types/SortDirection";
import ServiceStatusProgressBar from "#PLUGINS/services/src/js/components/ServiceStatusProgressBar";
import * as ServiceStatus from "../constants/ServiceStatus";
import ServiceStatusIcon from "../components/ServiceStatusIcon";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import ServiceTableUtil from "../utils/ServiceTableUtil";

const StatusMapping: any = {
  Running: "running-state"
};

export function statusRenderer(
  service: Service | ServiceTree
): React.ReactNode {
  const serviceStatus = service.getStatus();
  let serviceStatusClassSet: string = "";
  let statusContent: JSX.Element | null = null;
  if (typeof serviceStatus === "object") {
    serviceStatusClassSet = StatusMapping[serviceStatus.status] || "";
    statusContent = (
      <span className="status-bar-text">
        <Trans id={serviceStatus.status} />{" "}
        <Trans id={serviceStatus.countsText} values={serviceStatus.values} />
      </span>
    );
  } else if (
    serviceStatus !== null &&
    serviceStatus !== ServiceStatus.NA.displayName
  ) {
    serviceStatusClassSet = StatusMapping[serviceStatus] || "";
    statusContent = (
      <Trans id={serviceStatus} render="span" className="status-bar-text" />
    );
  }
  const instancesCount = service.getInstancesCount() as number;
  const runningInstances = service.getRunningInstancesCount() as number;
  // L10NTODO: Pluralize
  const tooltipContent = (
    <Trans render="span">
      {runningInstances} {StringUtil.pluralize("instance", runningInstances)}{" "}
      running out of {instancesCount}
    </Trans>
  );

  return (
    <TextCell>
      <div className="flex">
        <div className={`${serviceStatusClassSet} service-status-icon-wrapper`}>
          <ServiceStatusIcon
            service={service}
            showTooltip={true}
            tooltipContent={tooltipContent}
          />
          {statusContent}
        </div>
        <div className="service-status-progressbar-wrapper">
          <ServiceStatusProgressBar service={service} />
        </div>
      </div>
    </TextCell>
  );
}

export function statusSorter(
  data: Array<Service | Pod | ServiceTree>,
  sortDirection: SortDirection
): any {
  return ServiceTableUtil.sortData(data, sortDirection, "status");
}
