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

import { getQuotaLimit } from "../utils/QuotaUtil";

import ServiceTree from "../structs/ServiceTree";
import Service from "../structs/Service";

interface LimitInfo {
  limitText: string;
  servicesNotLimited: number;
}

function renderLimitLabel(limitInfo: LimitInfo) {
  let icon = null;
  switch (limitInfo.limitText) {
    case QuotaLimitStatuses.enforced:
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
    case QuotaLimitStatuses.partiallyEnforced:
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
    case QuotaLimitStatuses.notEnforced:
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

export function getLimitInfoForService(item: Service | ServiceTree): LimitInfo {
  const groupName =
    item instanceof ServiceTree ? item.getRootGroupName() : item.getRole();
  const stats = item.getQuotaRoleStats(groupName);

  return {
    limitText: getQuotaLimit({
      count: stats.servicesCount,
      groupRoleCount: stats.groupRolesCount
    }),
    servicesNotLimited: stats.servicesCount - stats.groupRolesCount
  };
}

export function getLimitInfoForServiceGroup(item: ServiceGroup): LimitInfo {
  if (!item.quota || !item.quota.serviceRoles) {
    return {
      limitText: "N/A",
      servicesNotLimited: 0
    };
  }

  return {
    limitText: getQuotaLimit(item.quota.serviceRoles),
    servicesNotLimited:
      item.quota.serviceRoles.count - item.quota.serviceRoles.groupRoleCount
  };
}

export function limitRenderer(item: ServiceGroup | ServiceTree | Service) {
  return renderLimitLabel(
    itemIsServiceGroup(item)
      ? getLimitInfoForServiceGroup(item)
      : getLimitInfoForService(item)
  );
}
