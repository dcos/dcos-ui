import * as React from "react";
import { Cell } from "@dcos/ui-kit";

import Node from "#SRC/js/structs/Node";
import * as ResourcesUtil from "#SRC/js/utils/ResourcesUtil";
import ProgressBar from "#SRC/js/components/ProgressBar";

export function getCpuUsage(data: Node): number {
  return data.getUsageStats("cpus").percentage;
}

const className = `color-${ResourcesUtil.getResourceColor("cpus")}`;

export function cpuRenderer(data: Node): React.ReactNode {
  return (
    <Cell>
      <div>
        <ProgressBar
          data={ProgressBar.getDataFromValue(getCpuUsage(data), className)}
          total={100}
        />

        <span className="table-content-spacing-left">{getCpuUsage(data)}%</span>
      </div>
    </Cell>
  );
}
