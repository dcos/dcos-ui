import * as React from "react";
import sort from "array-sort";
import Node from "#SRC/js/structs/Node";
import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";
import { TextCell } from "@dcos/ui-kit";

function getMemUsage(data: Node): number {
  return data.getUsageStats("mem").percentage;
}

export function memRenderer(data: Node): React.ReactNode {
  return (
    <TextCell>
      <span>{getMemUsage(data)}%</span>
    </TextCell>
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

export function memSizer(_args: WidthArgs): number {
  // TODO: DCOS-39147
  return 80;
}
