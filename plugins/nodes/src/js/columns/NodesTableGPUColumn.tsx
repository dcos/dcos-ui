import * as React from "react";
import sort from "array-sort";
import { Cell } from "@dcos/ui-kit";
import { WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";

import Node from "#SRC/js/structs/Node";
import * as ResourcesUtil from "#SRC/js/utils/ResourcesUtil";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";
import ProgressBar from "#SRC/js/components/ProgressBar";
import TableColumnResizeStore from "#SRC/js/stores/TableColumnResizeStore";
import { columnWidthsStorageKey } from "../components/NodesTable";

function getGpuUsage(data: Node): number {
  return data.getUsageStats("gpus").percentage;
}

const className = `color-${ResourcesUtil.getResourceColor("gpus")}`;

export function gpuRenderer(data: Node): React.ReactNode {
  return (
    <Cell>
      <div>
        <ProgressBar
          data={ProgressBar.getDataFromValue(getGpuUsage(data), className)}
          total={100}
        />
        <span className="table-content-spacing-left">{getGpuUsage(data)}%</span>
      </div>
    </Cell>
  );
}

function compareNodesByGpuUsage(a: Node, b: Node): number {
  return getGpuUsage(a) - getGpuUsage(b);
}

function compareNodesByHostname(a: Node, b: Node): number {
  return a
    .getHostName()
    .toLowerCase()
    .localeCompare(b.getHostName().toLowerCase());
}

const comparators = [compareNodesByGpuUsage, compareNodesByHostname];

export function gpuSorter(data: Node[], sortDirection: SortDirection): Node[] {
  const reverse = sortDirection !== "ASC";
  return sort(data, comparators, { reverse });
}

export function gpuWidth(_: WidthArgs) {
  return TableColumnResizeStore.get(columnWidthsStorageKey).gpu;
}
