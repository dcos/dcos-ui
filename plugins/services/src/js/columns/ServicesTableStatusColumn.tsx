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
import { getStatusIconProps } from "../utils/ServiceStatusIconUtil";

function statusCountsToTooltipContent(counts: {
  total: number;
  status: Record<ServiceStatus.StatusCategory, number>;
}): JSX.Element[] {
  return Object.keys(counts.status)
    .filter(value => value in ServiceStatus.StatusCategory)
    .sort(statusCategorySorter)
    .map((value, index) => {
      const category = value as ServiceStatus.StatusCategory;
      return (
        <div key={`status.${index}`}>
          {counts.status[category]}{" "}
          <Trans id={ServiceStatus.toCategoryLabel(category)} />
        </div>
      );
    });
}

//Incoming
interface StatusColumnProps {
  statusText: string;
  instancesCount: number;
  runningInstances: number;
  timeWaiting: string | null;
  timeQueued: number | null;
  serviceStatus: object;
  isServiceTree: boolean;
  isService: boolean;
  id: string | number;
  displayDeclinedOffers: boolean;
  appsWithWarnings: number | null;
  unableToLaunch: boolean;
}

interface TreeStatusColumnProps extends StatusColumnProps {
  statusText: string;
  totalCount: number;
  priorityStatusCount: number;
  tooltipContent: JSX.Element;
}

export function statusRenderer(
  service: Service | ServiceTree
): React.ReactNode {
  const iconProps = getStatusIconProps(service);

  const props = {
    statusText: service.getStatus(),
    instancesCount: service.getInstancesCount(),
    runningInstances: service.getRunningInstancesCount()
  };
  let serviceTreeProps = {};
  if (service instanceof ServiceTree) {
    const summary = service.getServiceTreeStatusSummary();
    const statusText = ServiceStatus.toCategoryLabel(summary.status);
    const totalCount = summary.counts.total;
    const priorityStatusCount = summary.counts.status[summary.status];
    const tooltipContent = statusCountsToTooltipContent(summary.counts);
    serviceTreeProps = {
      statusText,
      totalCount,
      priorityStatusCount,
      tooltipContent
    };
  }

  return service instanceof ServiceTree ? (
    <RenderServiceTree {...iconProps} {...props} {...serviceTreeProps} />
  ) : (
    <RenderService {...iconProps} {...props} />
  );
}

//Master
function RenderService(props: StatusColumnProps): React.ReactNode {
  //const status = service.getStatus();
  if (isNA(props.statusText)) {
    return null;
  }
  //const instancesCount = service.getInstancesCount();

  return (
    <TextCell>
      <div className="flex">
        <div className="service-status-icon-wrapper">
          <ServiceStatusIcon
            id={props.id}
            isService={props.isService}
            isServiceTree={props.isServiceTree}
            serviceStatus={props.serviceStatus}
            timeWaiting={props.timeWaiting}
            timeQueued={props.timeQueued}
            appsWithWarnings={props.appsWithWarnings}
            displayDeclinedOffers={props.displayDeclinedOffers}
            unableToLaunch={props.unableToLaunch}
            showTooltip={true}
            tooltipContent={
              <Plural
                value={props.runningInstances}
                one={`# instance running out of ${props.instancesCount}`}
                other={`# instances running out of ${props.instancesCount}`}
              />
            }
          />
          <Trans
            id={props.statusText}
            render="span"
            className="status-bar-text"
          />
        </div>
        <div className="service-status-progressbar-wrapper">
          <ServiceStatusProgressBar
            instancesCount={props.instancesCount}
            serviceStatus={props.serviceStatus}
            runningInstances={props.runningInstances}
          />
        </div>
      </div>
    </TextCell>
  );
}

function RenderServiceTree(props: TreeStatusColumnProps): React.ReactNode {
  if (isNA(props.statusText)) {
    return null;
  }
  return (
    <TextCell>
      <div className="service-status-icon-wrapper">
        <ServiceStatusIcon
          id={props.id}
          isService={props.isService}
          isServiceTree={props.isServiceTree}
          serviceStatus={props.serviceStatus}
          timeWaiting={props.timeWaiting}
          timeQueued={props.timeQueued}
          appsWithWarnings={props.appsWithWarnings}
          displayDeclinedOffers={props.displayDeclinedOffers}
          unableToLaunch={props.unableToLaunch}
          showTooltip={true}
          tooltipContent={<span>{props.tooltipContent}</span>}
        />
        <span className="status-bar-text">
          <Trans id={props.statusText} />{" "}
          {props.totalCount > 1 ? (
            <Trans>
              ({props.priorityStatusCount} of {props.totalCount})
            </Trans>
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
