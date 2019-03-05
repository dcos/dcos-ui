import * as React from "react";
import { Trans } from "@lingui/macro";
import sort from "array-sort";
import { Link } from "react-router";
import { Tooltip } from "reactjs-components";
import ipToInt from "ip-to-int";
import { Icon, TextCell } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  greyDark,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import Node from "#SRC/js/structs/Node";
import { SortDirection } from "#PLUGINS/nodes/src/js/types/SortDirection";

export function ipRenderer(data: Node): React.ReactNode {
  const nodeID = data.get("id");
  const headline = data.getIp();

  if (!data.isActive()) {
    return (
      <TextCell>
        <Link className="table-cell-link-primary" to={`/nodes/${nodeID}`}>
          <span title={headline}>
            <Tooltip
              anchor="start"
              content={<Trans render="span">Connection to node lost</Trans>}
            >
              <span className="icon-alert icon-margin-right">
                <Icon
                  color={greyDark}
                  shape={SystemIcons.Yield}
                  size={iconSizeXs}
                />
              </span>
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
