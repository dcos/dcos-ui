import * as React from "react";
import { Trans } from "@lingui/macro";
import { Cell, Tooltip } from "@dcos/ui-kit";

import {
  ServiceGroup,
  QuotaResources
} from "#PLUGINS/services/src/js/types/ServiceGroup";
import ProgressBar from "#SRC/js/components/ProgressBar";
import * as ResourcesUtil from "#SRC/js/utils/ResourcesUtil";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

const className = `color-${ResourcesUtil.getResourceColor("gpus")}`;

function getGPUConsumedPercent(gpuQuota: QuotaResources) {
  if (!gpuQuota.consumed || !gpuQuota.limit) {
    return 0;
  }
  return (gpuQuota.consumed / gpuQuota.limit) * 100;
}

function getGPUConsumedText(gpuQuota: QuotaResources) {
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
  const gpuQuota: QuotaResources | undefined = findNestedPropertyInObject(
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
