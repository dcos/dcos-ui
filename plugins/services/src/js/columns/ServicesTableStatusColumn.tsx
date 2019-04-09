import * as React from "react";
import { Plural, Trans } from "@lingui/macro";
import { TextCell } from "@dcos/ui-kit";

import { SortDirection } from "#PLUGINS/services/src/js/types/SortDirection";
import ServiceStatusProgressBar from "#PLUGINS/services/src/js/components/ServiceStatusProgressBar";
import * as ServiceStatus from "../constants/ServiceStatus";
import ServiceStatusIcon from "../components/ServiceStatusIcon";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
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

export function statusRenderer(node: Service | ServiceTree): React.ReactNode {
  return node instanceof ServiceTree
    ? renderServiceTree(node)
    : renderService(node);
}

function renderService(service: Service | Pod): React.ReactNode {
  const status = service.getStatus();
  if (isNA(status)) {
    return null;
  }
  const instancesCount = service.getInstancesCount();

  return (
    <TextCell>
      <div className="flex">
        <div className="service-status-icon-wrapper">
          <ServiceStatusIcon
            service={service}
            showTooltip={true}
            tooltipContent={
              <Plural
                value={service.getRunningInstancesCount()}
                one={`# instance running out of ${instancesCount}`}
                other={`# instances running out of ${instancesCount}`}
              />
            }
          />
          <Trans id={status} render="span" className="status-bar-text" />
        </div>
        <div className="service-status-progressbar-wrapper">
          <ServiceStatusProgressBar service={service} />
        </div>
      </div>
    </TextCell>
  );
}

function renderServiceTree(service: ServiceTree): React.ReactNode {
  const summary = service.getServiceTreeStatusSummary();
  const statusText = ServiceStatus.toCategoryLabel(summary.status);
  if (isNA(statusText)) {
    return null;
  }

  return (
    <TextCell>
      <div className="service-status-icon-wrapper">
        <ServiceStatusIcon
          service={service}
          showTooltip={true}
          tooltipContent={
            <span>{statusCountsToTooltipContent(summary.statusCounts)}</span>
          }
        />

        <span className="status-bar-text">
          <Trans id={statusText} />{" "}
          {summary.values.totalCount > 1 ? (
            <Trans
              id="({priorityStatusCount} of {totalCount})"
              values={summary.values}
            />
          ) : null}
        </span>
      </div>
    </TextCell>
  );
}

const isNA = (status: string) =>
  status === null || status === ServiceStatus.NA.displayName;

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
