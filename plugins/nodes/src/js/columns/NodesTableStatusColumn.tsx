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

export function statusRenderer(node: Node): React.ReactNode {
  const status = Status.fromNode(node);
  return <StatusCell status={status} />;
}

export const getStatus = (node: Node) => Status.fromNode(node).priority;
