import * as React from "react";
import sort from "array-sort";
import { Trans } from "@lingui/macro";
import { TextCell } from "@dcos/ui-kit";

import Node from "#SRC/js/structs/Node";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";

export function typeRenderer(data: Node): React.ReactNode {
  const type = data.isPublic() ? (
    <Trans render="span">Public</Trans>
  ) : (
    <Trans render="span">Private</Trans>
  );
  return <TextCell>{type}</TextCell>;
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
