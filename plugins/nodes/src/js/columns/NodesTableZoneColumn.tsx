import * as React from "react";
import sort from "array-sort";
import Node from "#SRC/js/structs/Node";
import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";
import { TextCell } from "@dcos/ui-kit";

export function zoneRenderer(data: Node): React.ReactNode {
  return (
    <TextCell>
      <span title={data.getZoneName()}>{data.getZoneName()}</span>
    </TextCell>
  );
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

export function zoneSizer(_args: WidthArgs): number {
  return 200;
}
