import * as React from "react";
import { Trans } from "@lingui/macro";
import { TextCell } from "@dcos/ui-kit";

import StringUtil from "#SRC/js/utils/StringUtil";
import ServiceStatusIcon from "../components/ServiceStatusIcon";
import * as ServiceStatus from "../constants/ServiceStatus";
import ServiceStatusProgressBar from "../components/ServiceStatusProgressBar";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import { SortDirection } from "plugins/services/src/js/types/SortDirection";
import ServiceTableUtil from "../utils/ServiceTableUtil";

const StatusMapping: any = {
  Running: "running-state"
};

export function statusRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  const serviceStatusText: string = service.getStatus();
  const serviceStatusClassSet: string = StatusMapping[serviceStatusText] || "";
  const instancesCount = service.getInstancesCount() as number;
  const runningInstances = service.getRunningInstancesCount() as number;
  // L10NTODO: Pluralize
  const tooltipContent = (
    <Trans render="span">
      {runningInstances} {StringUtil.pluralize("instance", runningInstances)}{" "}
      running out of {instancesCount}
    </Trans>
  );
  const hasStatusText =
    serviceStatusText !== (ServiceStatus as any).NA.displayName;

  return (
    <TextCell>
      <div className="flex">
        <div className={`${serviceStatusClassSet} service-status-icon-wrapper`}>
          <ServiceStatusIcon
            service={service}
            showTooltip={true}
            tooltipContent={tooltipContent}
          />
          {hasStatusText && (
            <Trans
              id={serviceStatusText}
              render="span"
              className="status-bar-text"
            />
          )}
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
