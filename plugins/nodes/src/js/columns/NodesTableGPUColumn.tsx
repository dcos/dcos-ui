import * as React from "react";
import sort from "array-sort";
import Node from "#SRC/js/structs/Node";
import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";
import { TextCell } from "@dcos/ui-kit";

function getGpuUsage(data: Node): number {
  return data.getUsageStats("gpus").percentage;
}

export function gpuRenderer(data: Node): React.ReactNode {
  return (
    <TextCell>
      <span>{getGpuUsage(data)}%</span>
    </TextCell>
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

export function gpuSizer(_args: WidthArgs): number {
  return 80;
}
