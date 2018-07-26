import * as React from "react";
import sort from "array-sort";
import Node from "#SRC/js/structs/Node";
import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";
import { Link } from "react-router";
import { Tooltip } from "reactjs-components";
import Icon from "#SRC/js/components/Icon";
import { TextCell } from "@dcos/ui-kit";

export function hostnameRenderer(data: Node): React.ReactNode {
  const nodeID = data.get("id");
  let headline = data.get("hostname");

  if (!data.isActive()) {
    return (
      <TextCell>
        <Link className="table-cell-link-primary" to={`/nodes/${nodeID}`}>
          <span title={headline}>
            <Tooltip anchor="start" content="Connection to node lost">
              <Icon
                className="icon-alert icon-margin-right"
                color="neutral"
                id="yield"
                size="mini"
              />
              {headline}
            </Tooltip>
          </span>
        </Link>
      </TextCell>
    );
  }

  return (
    <TextCell>
      <Link className="table-cell-link-primary" to={`/nodes/${nodeID}`}>
        <span title={headline}>{headline}</span>
      </Link>
    </TextCell>
  );
}

function compareNodesByHostname(a: Node, b: Node): number {
  return a
    .getHostName()
    .toLowerCase()
    .localeCompare(b.getHostName().toLowerCase());
}

const comparators = [compareNodesByHostname];
export function hostnameSorter(
  data: Node[],
  sortDirection: SortDirection
): Node[] {
  const reverse = sortDirection !== "ASC";
  return sort(data, comparators, { reverse });
}

export function hostnameSizer(_args: WidthArgs): number {
  return 150;
}
