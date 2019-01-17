import * as React from "react";
import sort from "array-sort";
import { Link } from "react-router";
import { Tooltip } from "reactjs-components";
import { TextCell } from "@dcos/ui-kit";
import ipToInt from "ip-to-int";

import Node from "#SRC/js/structs/Node";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";
import Icon from "#SRC/js/components/Icon";

export function ipRenderer(data: Node): React.ReactNode {
  const nodeID = data.get("id");
  const headline = data.getIp();

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

function compareNodesByIp(a: Node, b: Node): number {
  try {
    const ipA = ipToInt(a.getIp()).toInt();
    const ipB = ipToInt(b.getIp()).toInt();

    return ipA - ipB;
  } catch (e) {
    // Fallback to string compare
    return a
      .getHostName()
      .toLowerCase()
      .localeCompare(b.getHostName().toLowerCase());
  }
}

const comparators = [compareNodesByIp];
export function ipSorter(data: Node[], sortDirection: SortDirection): Node[] {
  const reverse = sortDirection !== "ASC";
  return sort(data, comparators, { reverse });
}
