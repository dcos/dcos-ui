import * as React from "react";
import { sort, compareString } from "@dcos/sorting";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";
import { Link } from "react-router";
import { Tooltip } from "reactjs-components";
import Icon from "#SRC/js/components/Icon";

import { TextCell } from "@dcos/ui-kit";

import {
  SortDirection,
  directionAwareComparators
} from "#PLUGINS/nodes/src/js/types/SortDirection";

function getHostname(data: Node): string {
  return data.getHostName();
}
export function hostnameRenderer(data: Node): React.ReactNode {
  const nodeID = data.get("id");
  let headline = getHostname(data);

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

export function hostnameSorter(
  data: Node[],
  sortDirection: SortDirection
): Node[] {
  return sort(
    directionAwareComparators([compareString(getHostname)], sortDirection),
    data
  );
}

export function hostnameSizer(args: WidthArgs): number {
  return Math.max(150, args.width / args.totalColumns);
}
