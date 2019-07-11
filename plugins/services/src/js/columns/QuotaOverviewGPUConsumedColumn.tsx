import * as React from "react";
import { Trans } from "@lingui/macro";
import { Cell, Tooltip } from "@dcos/ui-kit";

import { ServiceGroup } from "#PLUGINS/services/src/js/types/ServiceGroup";
import ProgressBar from "#SRC/js/components/ProgressBar";
import * as ResourcesUtil from "#SRC/js/utils/ResourcesUtil";

const className = `color-${ResourcesUtil.getResourceColor("gpus")}`;

export function gpuRenderer(group: ServiceGroup) {
  const quota = ServiceGroup.getQuota(group, "gpus");
  return (
    <Cell>
      {quota && quota.limit ? (
        <div>
          <ProgressBar
            data={ProgressBar.getDataFromValue(
              ServiceGroup.getQuotaPercentage(group, "gpus"),
              className
            )}
            total={100}
          />
          <div className="table-content-spacing-left table-content--inline-block">
            <Tooltip
              id="quota-gpu-tooltip"
              trigger={
                <span>{ServiceGroup.getQuotaPercentage(group, "gpus")}%</span>
              }
            >
              <Trans render="span">
                {quota.consumed} of {quota.limit} Cores
              </Trans>
            </Tooltip>
          </div>
        </div>
      ) : (
        <div>
          <Trans>No Limit</Trans>
        </div>
      )}
    </Cell>
  );
}
