import { TextCell } from "@dcos/ui-kit";
import * as React from "react";
import { Tooltip } from "reactjs-components";
import { Trans } from "@lingui/react";

import Node from "src/js/structs/Node";

export default function(item: Node) {
  const publicIps = item.getPublicIps();
  if (publicIps.length === 0) {
    return (
      <TextCell>
        <Trans>N/A</Trans>
      </TextCell>
    );
  }
  if (publicIps.length === 1) {
    return <TextCell>{publicIps[0]}</TextCell>;
  }
  return (
    <TextCell>
      <Tooltip content={publicIps.join(", ")}>{publicIps[0]}</Tooltip>
    </TextCell>
  );
}
