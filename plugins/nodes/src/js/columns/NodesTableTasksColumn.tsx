import * as React from "react";
import { compareNumber, compareString } from "@dcos/sorting";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "../types/IWidthArgs";
import { TextCell } from "@dcos/ui-kit";

function getTask(data: Node) {
  return data.get("TASK_RUNNING").toString();
}
function getHostname(data: Node): string {
  return data.getHostName();
}

export function tasksRenderer(data: Node): React.ReactNode {
  return (
    <TextCell>
      <span>{getTask(data)}</span>
    </TextCell>
  );
}

export const comparators = [compareNumber(getTask), compareString(getHostname)];

export function tasksSizer(args: WidthArgs): number {
  return Math.max(100, args.width / args.totalColumns);
}
