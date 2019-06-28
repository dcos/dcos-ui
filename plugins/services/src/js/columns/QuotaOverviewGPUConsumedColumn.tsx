import * as React from "react";
import { Trans } from "@lingui/macro";
import { Cell, Tooltip } from "@dcos/ui-kit";

import { ServiceGroup } from "#PLUGINS/services/src/js/types/ServiceGroup";
import ProgressBar from "#SRC/js/components/ProgressBar";
import * as ResourcesUtil from "#SRC/js/utils/ResourcesUtil";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

const className = `color-${ResourcesUtil.getResourceColor("gpus")}`;

interface Quota {
  guarantee: number;
  limit: number;
  consumed: number;
}

function getGPUConsumedPercent(gpuQuota: Quota) {
  return (gpuQuota.consumed / gpuQuota.limit) * 100;
}

function getGPUConsumedText(gpuQuota: Quota) {
  return (
    <Trans render="span">
      {gpuQuota.consumed} of {gpuQuota.limit} Cores
    </Trans>
  );
}

function noLimit() {
  return <Trans>No Limit</Trans>;
}

export function gpuRenderer(group: ServiceGroup) {
  const gpuQuota: Quota | undefined = findNestedPropertyInObject(
    group.quota,
    "gpus"
  );
  return (
    <Cell>
      {gpuQuota && gpuQuota.limit ? (
        <div>
          <ProgressBar
            data={ProgressBar.getDataFromValue(
              getGPUConsumedPercent(gpuQuota),
              className
            )}
            total={100}
          />
          <div className="table-content-spacing-left">
            <Tooltip
              id="quota-gpu-tooltip"
              trigger={<span>{getGPUConsumedPercent(gpuQuota)}%</span>}
            >
              {getGPUConsumedText(gpuQuota)}
            </Tooltip>
          </div>
        </div>
      ) : (
        <div>{noLimit()}</div>
      )}
    </Cell>
  );
}
