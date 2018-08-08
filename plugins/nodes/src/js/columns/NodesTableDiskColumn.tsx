import * as React from "react";
import sort from "array-sort";
import Node from "#SRC/js/structs/Node";
import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";
import { Cell } from "@dcos/ui-kit";
import ProgressBar from "#SRC/js/components/ProgressBar";

function getDiskUsage(data: Node) {
  return data.getUsageStats("disk").percentage;
}

export function diskRenderer(data: Node): React.ReactNode {
  return (
    <Cell>
      <ProgressBar
        data={[
          { value: data.getUsageStats("disk").percentage, className: "color-1" }
        ]}
        total={100}
      />

      <span className="table-content-spacing-left">{getDiskUsage(data)}%</span>
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
export function diskSizer(_args: WidthArgs): number {
  return 110;
}
