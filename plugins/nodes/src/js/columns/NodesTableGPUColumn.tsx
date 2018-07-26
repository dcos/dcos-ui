import * as React from "react";
import sort from "array-sort";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";
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

export function gpuSizer(args: WidthArgs): number {
  return Math.max(60, args.width / args.totalColumns);
}
