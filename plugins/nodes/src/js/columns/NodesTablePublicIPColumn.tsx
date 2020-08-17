import * as React from "react";
import { Tooltip } from "reactjs-components";
import { TextCell } from "@dcos/ui-kit";
import { Trans } from "@lingui/macro";

import Node from "#SRC/js/structs/Node";

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
  const publicIps = item.getPublicIps();

  return <NodePublicIp firstIp={publicIps[0]} allIps={publicIps.join(", ")} />;
};

export { NodesTablePublicIpColumn as default };
