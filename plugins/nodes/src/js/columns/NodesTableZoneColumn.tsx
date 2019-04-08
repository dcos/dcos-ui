import * as React from "react";
import sort from "array-sort";
import { TextCell } from "@dcos/ui-kit";

import Node from "#SRC/js/structs/Node";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";

const NodeZone = React.memo(({ name }: { name: string }) => (
  <TextCell>
    <span title={name}>{name}</span>
  </TextCell>
));
export function zoneRenderer(data: Node): React.ReactNode {
  return <NodeZone name={data.getZoneName()} />;
}

function compareNodesByZone(a: Node, b: Node): number {
  return a
    .getZoneName()
    .toLowerCase()
    .localeCompare(b.getZoneName().toLowerCase());
}

function compareNodesByHostname(a: Node, b: Node): number {
  return a
    .getHostName()
    .toLowerCase()
    .localeCompare(b.getHostName().toLowerCase());
}

const comparators = [compareNodesByZone, compareNodesByHostname];

export function zoneSorter(data: Node[], sortDirection: SortDirection): Node[] {
  const reverse = sortDirection !== "ASC";
  return sort(data, comparators, { reverse });
}
