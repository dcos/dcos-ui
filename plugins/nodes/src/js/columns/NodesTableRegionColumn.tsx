import * as React from "react";
import sort from "array-sort";
import Node from "#SRC/js/structs/Node";
import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";
import { TextCell } from "@dcos/ui-kit";

export function regionRenderer(
  masterRegion: string,
  data: Node
): React.ReactNode {
  const regionName =
    data.getRegionName() +
    (masterRegion === data.getRegionName() ? " (Local)" : "");

  return (
    <TextCell>
      <span title={regionName}>{regionName}</span>
    </TextCell>
  );
}

function compareNodesByRegion(a: Node, b: Node): number {
  return a
    .getRegionName()
    .toLowerCase()
    .localeCompare(b.getRegionName().toLowerCase());
}

function compareNodesByHostname(a: Node, b: Node): number {
  return a
    .getHostName()
    .toLowerCase()
    .localeCompare(b.getHostName().toLowerCase());
}

const comparators = [compareNodesByRegion, compareNodesByHostname];
export function regionSorter(
  data: Node[],
  sortDirection: SortDirection
): Node[] {
  const reverse = sortDirection !== "ASC";
  return sort(data, comparators, { reverse });
}

export function regionSizer(_args: WidthArgs): number {
  return 200;
}
