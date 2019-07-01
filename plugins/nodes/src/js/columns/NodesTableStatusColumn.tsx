import * as React from "react";
import { Cell, Icon } from "@dcos/ui-kit";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import { Status } from "../types/Status";

import Node from "#SRC/js/structs/Node";

const StatusCell = React.memo(({ status }: { status: Status }) => (
  <Cell>
    <span>
      <Icon {...status.icon} size={iconSizeXs} />
      <span style={{ marginLeft: "7px" }}>{status.displayName}</span>
    </span>
  </Cell>
));

export function statusRenderer(data: Node): React.ReactNode {
  const status = data.getStatus();

  return <StatusCell status={status} />;
}

export const compareByStatus = (a: Node, b: Node): number =>
  a.getStatus().priority - b.getStatus().priority;
