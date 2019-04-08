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
import ServiceTree, { ServiceTreeStatusSummary } from "../structs/ServiceTree";
import ServiceTableUtil from "../utils/ServiceTableUtil";

function statusCountsToTooltipContent(
  statusCounts: Record<ServiceStatus.StatusCategory, number>
): JSX.Element[] {
  return Object.keys(statusCounts)
    .filter(value => value in ServiceStatus.StatusCategory)
    .sort(statusCategorySorter)
    .map((value, index) => {
      const category = value as ServiceStatus.StatusCategory;
      return (
        <div key={`status.${index}`}>
          {statusCounts[category]}{" "}
          <Trans id={ServiceStatus.toCategoryLabel(category)} />
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
  let statusContent: JSX.Element | null = null;
  let tooltipContent: JSX.Element;
  if (typeof serviceStatus === "object" && serviceStatus !== null) {
    const statusText = ServiceStatus.toCategoryLabel(serviceStatus.status);
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
        <div className="service-status-icon-wrapper">
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

export function statusCategorySorter(a: string, b: string): number {
  return (
    ServiceStatus.toCategoryPriority(b as ServiceStatus.StatusCategory) -
    ServiceStatus.toCategoryPriority(a as ServiceStatus.StatusCategory)
  );
}
