import * as React from "react";
import Node from "#SRC/js/structs/Node";

// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";
import ProgressBar from "#SRC/js/components/ProgressBar";
import { Cell } from "@dcos/ui-kit";

export function cpubarRenderer(data: Node): React.ReactNode {
  return (
    <Cell>
      <ProgressBar
        data={[
          { value: data.getUsageStats("cpus").percentage, className: "color-1" }
        ]}
        total={100}
      />
    </Cell>
  );
}

export function cpubarSizer(_args: WidthArgs): number {
  // TODO: DCOS-39147
  return 60;
}
