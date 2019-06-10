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

function getDiskUsage(data: Node) {
  return data.getUsageStats("disk").percentage;
}

const className = `color-${ResourcesUtil.getResourceColor("disk")}`;

export function diskRenderer(data: Node): React.ReactNode {
  return (
    <Cell>
      <div>
        <ProgressBar
          data={ProgressBar.getDataFromValue(getDiskUsage(data), className)}
          total={100}
        />

        <span className="table-content-spacing-left">
          {getDiskUsage(data)}%
        </span>
      </div>
    </Cell>
  );
}

function compareNodesByDiskUsage(a: Node, b: Node): number {
  return getDiskUsage(a) - getDiskUsage(b);
}

function compareNodesByHostname(a: Node, b: Node): number {
  return a
    .getHostName()
    .toLowerCase()
    .localeCompare(b.getHostName().toLowerCase());
}

const comparators = [compareNodesByDiskUsage, compareNodesByHostname];
export function diskSorter(data: Node[], sortDirection: SortDirection): Node[] {
  const reverse = sortDirection !== "ASC";
  return sort(data, comparators, { reverse });
}

export function diskWidth(_: WidthArgs) {
  return TableColumnResizeStore.get(columnWidthsStorageKey).disk;
}
