import * as React from "react";
import { Trans } from "@lingui/macro";
import { NumberCell } from "@dcos/ui-kit";
import { Tooltip } from "reactjs-components";
import { WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";

import TableColumnResizeStore from "#SRC/js/stores/TableColumnResizeStore";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import { EmptyStates } from "#SRC/js/constants/EmptyStates";
import StringUtil from "#SRC/js/utils/StringUtil";
import { SortDirection } from "plugins/services/src/js/types/SortDirection";
import ServiceTableUtil from "../utils/ServiceTableUtil";
// import { columnWidthsStorageKey } from "../containers/services/ServicesTable";
const columnWidthsStorageKey = "servicesTableColWidths";

const ServiceInstances = React.memo(
  ({
    instancesCount,
    runningInstances
  }: {
    instancesCount: number;
    runningInstances: number;
  }) => {
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
);

export function instancesRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  return (
    <ServiceInstances
      instancesCount={service.getInstancesCount()}
      runningInstances={service.getRunningInstancesCount()}
    />
  );
}

export function instancesSorter(
  data: Array<Service | Pod | ServiceTree>,
  sortDirection: SortDirection
): any {
  return ServiceTableUtil.sortData(data, sortDirection, "instances");
}

export function instancesWidth(_: WidthArgs) {
  return TableColumnResizeStore.get(columnWidthsStorageKey).instances;
}
