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

function getMemUsage(data: Node): number {
  return data.getUsageStats("mem").percentage;
}

const className = `color-${ResourcesUtil.getResourceColor("mem")}`;

export function memRenderer(data: Node): React.ReactNode {
  return (
    <Cell>
      <div>
        <ProgressBar
          data={ProgressBar.getDataFromValue(getMemUsage(data), className)}
          total={100}
        />

        <span className="table-content-spacing-left">{getMemUsage(data)}%</span>
      </div>
    </Cell>
  );
}

function compareNodesByMemUsage(a: Node, b: Node): number {
  return getMemUsage(a) - getMemUsage(b);
}

function compareNodesByHostname(a: Node, b: Node): number {
  return a
    .getHostName()
    .toLowerCase()
    .localeCompare(b.getHostName().toLowerCase());
}

const comparators = [compareNodesByMemUsage, compareNodesByHostname];
export function memSorter(data: Node[], sortDirection: SortDirection): Node[] {
  const reverse = sortDirection !== "ASC";
  return sort(data, comparators, { reverse });
}

export function memWidth(_: WidthArgs) {
  return TableColumnResizeStore.get(columnWidthsStorageKey).mem;
}
