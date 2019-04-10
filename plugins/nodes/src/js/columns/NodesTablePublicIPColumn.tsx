import * as React from "react";
import { Tooltip } from "reactjs-components";
import { TextCell } from "@dcos/ui-kit/dist/packages/table";
import { WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";
import { Trans } from "@lingui/macro";

import Node from "#SRC/js/structs/Node";
import TableColumnResizeStore from "#SRC/js/stores/TableColumnResizeStore";
import { columnWidthsStorageKey } from "../components/NodesTable";

const NodePublicIp = React.memo(
  ({ firstIp, allIps }: { firstIp: string; allIps: string }) => {
    if (!firstIp) {
      return (
        <TextCell>
          <Trans>N/A</Trans>
        </TextCell>
      );
    }

    if (!allIps) {
      return <TextCell>{firstIp}</TextCell>;
    }

    return (
      <TextCell>
        <Tooltip content={allIps}>{firstIp}</Tooltip>
      </TextCell>
    );
  }
);

const NodesTablePublicIpColumn = (item: Node) => {
  const publicIps = item.getPublicIps() || [];

  return <NodePublicIp firstIp={publicIps[0]} allIps={publicIps.join(", ")} />;
};

const publicIPWidth = (_: WidthArgs) =>
  TableColumnResizeStore.get(columnWidthsStorageKey).publicIP;

export { NodesTablePublicIpColumn as default, publicIPWidth };
