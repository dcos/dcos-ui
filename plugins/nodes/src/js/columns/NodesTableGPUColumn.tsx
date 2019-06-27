import * as React from "react";
import { Cell } from "@dcos/ui-kit";

import Node from "#SRC/js/structs/Node";
import * as ResourcesUtil from "#SRC/js/utils/ResourcesUtil";
import ProgressBar from "#SRC/js/components/ProgressBar";

export function getGpuUsage(data: Node): number {
  return data.getUsageStats("gpus").percentage;
}

const className = `color-${ResourcesUtil.getResourceColor("gpus")}`;

export function gpuRenderer(data: Node): React.ReactNode {
  return (
    <Cell>
      <div>
        <ProgressBar
          data={ProgressBar.getDataFromValue(getGpuUsage(data), className)}
          total={100}
        />
        <span className="table-content-spacing-left">{getGpuUsage(data)}%</span>
      </div>
    </Cell>
  );
}
