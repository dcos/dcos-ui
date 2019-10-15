import * as React from "react";
import { Trans, Plural } from "@lingui/macro";
import { Icon, TextCell, Tooltip } from "@dcos/ui-kit";
import {
  greyLight,
  blue,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";

import {
  ServiceGroup,
  QuotaLimitStatuses
} from "#PLUGINS/services/src/js/types/ServiceGroup";

// @ts-ignore
import MesosStateStore from "#SRC/js/stores/MesosStateStore";

import { getQuotaLimit } from "../utils/QuotaUtil";

import ServiceTree from "../structs/ServiceTree";
import Service from "../structs/Service";
import Pod from "../structs/Pod";

interface LimitInfo {
  limitText: string;
  servicesNotLimited: number;
}

function renderLimitLabel(limitInfo: LimitInfo) {
  let icon = null;
  switch (limitInfo.limitText) {
    case QuotaLimitStatuses.applied:
      icon = (
        <div className="table-content-spacing-right table-content-inline-block">
          <Icon
            color={blue}
            shape={SystemIcons.CircleCheck}
            size={iconSizeXs}
          />
        </div>
      );
      break;
    case QuotaLimitStatuses.partiallyApplied:
      icon = (
        <div className="table-content-spacing-right table-content-inline-block">
          <Tooltip
            id="quota-limit-tooltip"
            trigger={
              <Icon
                color={greyLight}
                shape={SystemIcons.CircleMinus}
                size={iconSizeXs}
              />
            }
          >
            <Plural
              value={limitInfo.servicesNotLimited}
              one="# service has no quota limit."
              other="# services have no quota limit."
            />
          </Tooltip>
        </div>
      );
      break;
    case QuotaLimitStatuses.notApplied:
      icon = (
        <div className="table-content-spacing-right table-content-inline-block">
          <Icon
            color={greyLight}
            shape={SystemIcons.CircleMinus}
            size={iconSizeXs}
          />
        </div>
      );
      break;
    case QuotaLimitStatuses.na:
      icon = (
        <div className="table-content-spacing-right table-content-inline-block">
          <Icon
            color={greyLight}
            shape={SystemIcons.CircleMinus}
            size={iconSizeXs}
          />
        </div>
      );
      break;
  }

  return (
    <TextCell>
      <div className="service-table-heading flex-box flex-box-align-vertical-center table-cell-flex-box text-overflow">
        <span className="icon-margin-right">{icon}</span>
        <Trans
          id={limitInfo.limitText}
          render="span"
          className="table-cell-value table-cell-flex-box"
        />
      </div>
    </TextCell>
  );
}

function itemIsServiceGroup(item: any): item is ServiceGroup {
  return item.quota && item.quota.limitStatus;
}

export function getLimitInfoForPod(item: Pod): LimitInfo {
  return {
    limitText:
      item.getRole() === item.getRootGroupName()
        ? QuotaLimitStatuses.applied
        : QuotaLimitStatuses.notApplied,
    servicesNotLimited: 0
  };
}

export function getLimitInfoForService(
  item: Pod | Service | ServiceTree
): LimitInfo {
  if (item instanceof Pod) {
    return getLimitInfoForPod(item);
  }

  const groupName = item.getRootGroupName();
  const stats = item.getQuotaRoleStats(
    groupName,
    MesosStateStore.getTasksByService.bind(MesosStateStore)
  );

  return {
    limitText: getQuotaLimit({
      count: stats.count,
      groupRoleCount: stats.groupRoleCount
    }),
    servicesNotLimited: stats.count - stats.groupRoleCount
  };
}

export function getLimitInfoForServiceGroup(item: ServiceGroup): LimitInfo {
  if (!item.quota || !item.quota.serviceRoles) {
    return {
      limitText: QuotaLimitStatuses.na,
      servicesNotLimited: 0
    };
  }

  return {
    limitText: getQuotaLimit(item.quota.serviceRoles),
    servicesNotLimited:
      item.quota.serviceRoles.count - item.quota.serviceRoles.groupRoleCount
  };
}

export function limitRenderer(
  item: ServiceGroup | ServiceTree | Service | Pod
) {
  return renderLimitLabel(
    itemIsServiceGroup(item)
      ? getLimitInfoForServiceGroup(item)
      : getLimitInfoForService(item)
  );
}
