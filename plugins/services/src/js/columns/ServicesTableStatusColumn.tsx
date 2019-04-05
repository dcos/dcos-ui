import * as React from "react";
import { Trans } from "@lingui/macro";
import { TextCell } from "@dcos/ui-kit";

import StringUtil from "#SRC/js/utils/StringUtil";
import {
  StatusIconPriority,
  StatusIconText,
  StatusIconNames
} from "#SRC/js/constants/StatusIcon";
import { SortDirection } from "#PLUGINS/services/src/js/types/SortDirection";
import ServiceStatusProgressBar from "#PLUGINS/services/src/js/components/ServiceStatusProgressBar";
import * as ServiceStatus from "../constants/ServiceStatus";
import ServiceStatusIcon from "../components/ServiceStatusIcon";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree, { ServiceTreeStatusSummary } from "../structs/ServiceTree";
import ServiceTableUtil from "../utils/ServiceTableUtil";

const StatusMapping: any = {
  Running: "running-state"
};

function statusCountsToTooltipContent(
  statusCounts: Record<StatusIconNames, number>
): JSX.Element[] {
  return Object.keys(statusCounts)
    .sort((a, b) => {
      const statusNameA = a as StatusIconNames;
      const statusNameB = b as StatusIconNames;
      return StatusIconPriority[statusNameA] - StatusIconPriority[statusNameB];
    })
    .filter(value => (value as StatusIconNames) in StatusIconText)
    .map((value, index) => {
      const iconName = value as StatusIconNames;
      return (
        <div key={`status.${index}`}>
          {statusCounts[iconName]} <Trans id={StatusIconText[iconName]} />
        </div>
      );
    });
}

export function statusRenderer(
  service: Service | ServiceTree
): React.ReactNode {
  const serviceStatus:
    | string
    | ServiceTreeStatusSummary
    | null = service.getStatus();
  let serviceStatusClassSet: string = "";
  let statusContent: JSX.Element | null = null;
  let tooltipContent: JSX.Element;
  if (typeof serviceStatus === "object" && serviceStatus !== null) {
    const statusText = StatusIconText[serviceStatus.status];
    serviceStatusClassSet = StatusMapping[statusText] || "";
    statusContent = (
      <span className="status-bar-text">
        <Trans id={statusText} />{" "}
        <Trans id={serviceStatus.countsText} values={serviceStatus.values} />
      </span>
    );
    tooltipContent = (
      <span>{statusCountsToTooltipContent(serviceStatus.statusCounts)}</span>
    );
  } else {
    if (
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
    tooltipContent = (
      <Trans render="span">
        {runningInstances} {StringUtil.pluralize("instance", runningInstances)}{" "}
        running out of {instancesCount}
      </Trans>
    );
  }

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
