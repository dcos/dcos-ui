import * as React from "react";
import sort from "array-sort";
import { Trans } from "@lingui/macro";
import { TextCell } from "@dcos/ui-kit";
import { WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";

import Node from "#SRC/js/structs/Node";
import TableColumnResizeStore from "#SRC/js/stores/TableColumnResizeStore";
import { columnWidthsStorageKey } from "../components/NodesTable";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";

const NodeType = React.memo(({ isPublic }: { isPublic: boolean }) => {
  const type = isPublic ? (
    <Trans render="span">Public</Trans>
  ) : (
    <Trans render="span">Private</Trans>
  );
  return <TextCell>{type}</TextCell>;
});

export function typeRenderer(data: Node): React.ReactNode {
  return <NodeType isPublic={data.isPublic()} />;
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

export function typeWidth(_: WidthArgs) {
  return TableColumnResizeStore.get(columnWidthsStorageKey).type;
}
