import * as React from "react";
import sort from "array-sort";
import Node from "#SRC/js/structs/Node";
import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";
import { TextCell } from "@dcos/ui-kit";

export function typeRenderer(data: Node): React.ReactNode {
  const type = data.isPublic() ? "Public" : "Private";
  return (
    <TextCell>
      <span>{type}</span>
    </TextCell>
  );
}

function compareNodesByType(a: Node, b: Node): number {
  return a
    .isPublic()
    .toString()
    .localeCompare(b.isPublic().toString());
}

function compareNodesByHostname(a: Node, b: Node): number {
  return a
    .getHostName()
    .toLowerCase()
    .localeCompare(b.getHostName().toLowerCase());
}

const comparators = [compareNodesByType, compareNodesByHostname];

export function typeSorter(data: Node[], sortDirection: SortDirection): Node[] {
  const reverse = sortDirection !== "ASC";
  return sort(data, comparators, { reverse });
}

export function typeSizer(_args: WidthArgs): number {
  return 70;
}
