import * as React from "react";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";
import ProgressBar from "#SRC/js/components/ProgressBar";

export function membarRenderer(data: Node): React.ReactNode {
  return (
    <ProgressBar
      data={[
        { value: data.getUsageStats("mem").percentage, className: "color-1" }
      ]}
      total={100}
    />
  );
}

export function membarSizer(args: WidthArgs): number {
  // TODO: DCOS-39147
  return Math.min(60, Math.max(60, args.width / args.totalColumns));
}
