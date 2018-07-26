import * as React from "react";
import sort from "array-sort";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";
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

export function regionSizer(args: WidthArgs): number {
  return Math.max(170, args.width / args.totalColumns);
}
