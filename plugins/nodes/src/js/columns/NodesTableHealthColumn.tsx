import * as React from "react";
import { TextCell } from "@dcos/ui-kit";
import UnitHealthUtil from "#SRC/js/utils/UnitHealthUtil";

import Node from "#SRC/js/structs/Node";

const NodeHealth = ({
  classNames,
  title
}: {
  classNames: string;
  title: string;
}) => (
  <TextCell>
    <span className={classNames}>{title}</span>
  </TextCell>
);
const NodeHealthMemo = React.memo(NodeHealth);

export function healthRenderer(data: Node): React.ReactNode {
  const health: any = data.getHealth();
  return <NodeHealthMemo classNames={health.classNames} title={health.title} />;
}

export const healthRank = UnitHealthUtil.getHealthSorting;
