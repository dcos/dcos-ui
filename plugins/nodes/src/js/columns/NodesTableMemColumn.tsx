import * as React from "react";
import { Cell } from "@dcos/ui-kit";

import Node from "#SRC/js/structs/Node";
import * as ResourcesUtil from "#SRC/js/utils/ResourcesUtil";
import ProgressBar from "#SRC/js/components/ProgressBar";

export function getMemUsage(data: Node): number {
  return data.getUsageStats("mem").percentage;
}

const className = `color-${ResourcesUtil.getResourceColor("mem")}`;

export function memRenderer(data: Node): React.ReactNode {
  return (
    <Cell>
      <div>
        <ProgressBar
          data={ProgressBar.getDataFromValue(getMemUsage(data), className)}
          total={100}
        />

        <span className="table-content-spacing-left">{getMemUsage(data)}%</span>
      </div>
    </Cell>
  );
}
