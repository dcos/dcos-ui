import * as React from "react";
import sort from "array-sort";
import Node from "#SRC/js/structs/Node";
import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";
import { TextCell } from "@dcos/ui-kit";

function getCpuUsage(data: Node): number {
  return data.getUsageStats("cpus").percentage;
}

export function cpuRenderer(data: Node): React.ReactNode {
  return (
    <TextCell>
      <span>{getCpuUsage(data)}%</span>
    </TextCell>
  );
}

function compareNodesByCpuUsage(a: Node, b: Node): number {
  return getCpuUsage(a) - getCpuUsage(b);
}

function compareNodesByHostname(a: Node, b: Node): number {
  return a
    .getHostName()
    .toLowerCase()
    .localeCompare(b.getHostName().toLowerCase());
}

const comparators = [compareNodesByCpuUsage, compareNodesByHostname];
export function cpuSorter(data: Node[], sortDirection: SortDirection): Node[] {
  const reverse = sortDirection !== "ASC";
  return sort(data, comparators, { reverse });
}

export function cpuSizer(args: WidthArgs): number {
  // TODO: DCOS-39147
  return Math.min(60, Math.max(60, args.width / args.totalColumns));
}
