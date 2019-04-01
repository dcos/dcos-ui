import * as React from "react";
import { Trans } from "@lingui/macro";
import { NumberCell } from "@dcos/ui-kit";
import { Tooltip } from "reactjs-components";

import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import { EmptyStates } from "#SRC/js/constants/EmptyStates";
import StringUtil from "#SRC/js/utils/StringUtil";
import { SortDirection } from "plugins/services/src/js/types/SortDirection";
import ServiceTableUtil from "../utils/ServiceTableUtil";

export function instancesRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  const instancesCount = service.getInstancesCount();
  const runningInstances = service.getRunningInstancesCount();
  const overview =
    runningInstances === instancesCount
      ? ` ${runningInstances}`
      : ` ${runningInstances}/${instancesCount}`;

  const content = !Number.isInteger(instancesCount)
    ? EmptyStates.CONFIG_VALUE
    : overview;

  // L10NTODO: Pluralize
  const tooltipContent = (
    <Trans render="span">
      {runningInstances} {StringUtil.pluralize("instance", runningInstances)}{" "}
      running out of {instancesCount}
    </Trans>
  );

  return (
    <NumberCell>
      <Tooltip content={tooltipContent}>
        <span>{content}</span>
      </Tooltip>
    </NumberCell>
  );
}

export function instancesSorter(
  data: Array<Service | Pod | ServiceTree>,
  sortDirection: SortDirection
): any {
  return ServiceTableUtil.sortData(data, sortDirection, "instances");
}
