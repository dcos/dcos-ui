import * as React from "react";
import { compareValues } from "#PLUGINS/nodes/src/js/utils/compareValues";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";
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

export function hostnameSorter(
  data: Node[],
  sortDirection: SortDirection
): Node[] {
  // current implementation is a rough idea, not sure if it is the best one…
  const sortedData = data.sort((a, b) =>
    compareValues(
      a.getHostName().toLowerCase(),
      b.getHostName().toLowerCase(),
      a.getHostName().toLowerCase(),
      b.getHostName().toLowerCase()
    )
  );
  return sortDirection === "ASC" ? sortedData : sortedData.reverse();
}

export function hostnameSizer(args: WidthArgs): number {
  return Math.max(150, args.width / args.totalColumns);
}
