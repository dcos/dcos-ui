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

const className = `color-${ResourcesUtil.getResourceColor("mem")}`;

function getMemoryConsumedPercent(memoryQuota: QuotaResources) {
  if (!memoryQuota.consumed || !memoryQuota.limit) {
    return 0;
  }
  return (memoryQuota.consumed / memoryQuota.limit) * 100;
}

function getMemoryConsumedText(memoryQuota: QuotaResources) {
  return (
    <Trans render="span">
      {memoryQuota.consumed} of {memoryQuota.limit} MiB
    </Trans>
  );
}

function noLimit() {
  return <Trans>No Limit</Trans>;
}

export function memRenderer(group: ServiceGroup) {
  const memoryQuota: QuotaResources | undefined = findNestedPropertyInObject(
    group.quota,
    "memory"
  );
  return (
    <Cell>
      {memoryQuota && memoryQuota.limit ? (
        <div>
          <ProgressBar
            data={ProgressBar.getDataFromValue(
              getMemoryConsumedPercent(memoryQuota),
              className
            )}
            total={100}
          />
          <div className="table-content-spacing-left">
            <Tooltip
              id="quota-memory-tooltip"
              trigger={<span>{getMemoryConsumedPercent(memoryQuota)}%</span>}
            >
              {getMemoryConsumedText(memoryQuota)}
            </Tooltip>
          </div>
        </div>
      ) : (
        <div>{noLimit()}</div>
      )}
    </Cell>
  );
}
