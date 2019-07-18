import * as React from "react";
import { Trans } from "@lingui/macro";
import { TextCell } from "@dcos/ui-kit";

import Node from "#SRC/js/structs/Node";

const NodeType = React.memo(({ isPublic }: { isPublic: boolean }) => {
  const type = isPublic ? (
    <Trans render="span">Public</Trans>
  ) : (
    <Trans render="span">Private</Trans>
  );
  return <TextCell>{type}</TextCell>;
});

export function typeRenderer(data: Node): React.ReactNode {
  return <NodeType isPublic={data.isPublic()} />;
}

export const getType = (a: Node) => a.isPublic().toString();
