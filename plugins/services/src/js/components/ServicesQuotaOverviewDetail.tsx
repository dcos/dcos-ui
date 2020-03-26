import { Trans, Plural } from "@lingui/macro";
import * as React from "react";
import { combineLatest, of, Observable } from "rxjs";
import {
  map,
  catchError,
  distinctUntilChanged,
  switchMap,
} from "rxjs/operators";
import { componentFromStream } from "@dcos/data-service";
import gql from "graphql-tag";
import { DataLayer, DataLayerType } from "@extension-kid/data-layer";
import { InfoBoxInline, Icon, SpacingBox } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import Loader from "#SRC/js/components/Loader";
import container from "#SRC/js/container";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import Units from "#SRC/js/utils/Units";
import ProgressBar from "#SRC/js/components/ProgressBar";
import * as ResourcesUtil from "#SRC/js/utils/ResourcesUtil";
import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import { ServiceGroup, QuotaResources } from "../types/ServiceGroup";
import * as QuotaUtil from "../utils/QuotaUtil";
import ServiceTree from "../structs/ServiceTree";
import ServicesQuotaOverviewTable from "./ServicesQuotaOverviewTable";

export interface ServicesQuotaOverviewDetailProps {
  id: string;
}

function getQuotaPercentage(
  group: ServiceGroup,
  resource: string
): number | null {
  const resourceQuota: QuotaResources | undefined = findNestedPropertyInObject(
    group.quota,
    resource
  );
  if (!resourceQuota || !resourceQuota.limit) {
    return null;
  }

  if (!resourceQuota.consumed) {
    return 0;
  }

  return QuotaUtil.formatQuotaPercentageForDisplay(
    resourceQuota.consumed,
    resourceQuota.limit
  );
}

function getQuotaConsumedOfLimit(
  group: ServiceGroup,
  resource: string
): React.ReactNode | null {
  const resourceQuota: QuotaResources | undefined = findNestedPropertyInObject(
    group.quota,
    resource
  );

  if (!resourceQuota || !resourceQuota.limit) {
    return null;
  }
  const consumed = QuotaUtil.formatQuotaValueForDisplay(
    resourceQuota.consumed || 0
  );
  const limit = QuotaUtil.formatQuotaValueForDisplay(resourceQuota.limit);

  if (resource === "cpus" || resource === "gpus") {
    return <Trans id="{0} of {1} Cores" values={{ 0: consumed, 1: limit }} />;
  }

  return (
    <Trans
      id="{0} of {1}"
      values={{
        0: Units.filesize(consumed * 1024 * 1024, 0),
        1: Units.filesize(limit * 1024 * 1024, 0),
      }}
    />
  );
}

const titleFor = (resource: string): string => {
  switch (resource) {
    case "cpus":
      return "CPUs";
    case "gpus":
      return "GPUs";
    case "disk":
      return "Disk";
    case "memory":
      return "Memory";
  }
  return "";
};

function getCard(group: ServiceGroup, resource: string): React.ReactNode {
  const title = titleFor(resource);
  const percent = getQuotaPercentage(group, resource);
  const className = `color-${ResourcesUtil.getResourceColor(
    resource === "memory" ? "mem" : resource
  )}`;

  return (
    <div className="panel quota-card">
      <div className="panel-content">
        <div className="quota-card-title">
          <div className="panel-header panel-cell panel-cell-light panel-cell-narrow panel-cell-shorter">
            <Trans id={title} render="h2" className="flush text-align-center" />
          </div>
        </div>
        <div className="quota-card-main unit unit-primary">
          {percent === null ? <Trans>N/A</Trans> : percent}
          {percent === null ? null : <sup>%</sup>}
        </div>
        <div className="quota-card-label">
          {percent === null ? (
            <Trans>No Limit</Trans>
          ) : (
            getQuotaConsumedOfLimit(group, resource)
          )}
        </div>
        <ProgressBar
          data={ProgressBar.getDataFromValue(percent || 0, className)}
          total={100}
          className="quota-progress-bar"
        />
      </div>
    </div>
  );
}

function getNoLimitInfobox(group: ServiceGroup) {
  if (!group.quota || !group.quota.serviceRoles) {
    return null;
  }

  const { count, groupRoleCount } = group.quota.serviceRoles;
  const nonLimited = count - groupRoleCount;

  if (!nonLimited) {
    return null;
  }

  return (
    <SpacingBox side="bottom" spacingSize="l">
      <InfoBoxInline
        className="quota-info"
        appearance="default"
        message={
          <React.Fragment>
            <Icon
              shape={SystemIcons.CircleInformation}
              size={iconSizeXs}
              color="currentColor"
            />{" "}
            <Plural
              value={nonLimited}
              one="# service is not limited by quota. Update role to have quota
            enforced."
              other="# services are not limited by quota. Update role to
            have quota enforced."
            />
          </React.Fragment>
        }
      />
    </SpacingBox>
  );
}

export interface ServicesQuotaOverviewDetailProps {
  id: string;
  serviceTree: ServiceTree;
}

const ServicesQuotaOverviewDetail = componentFromStream<
  ServicesQuotaOverviewDetailProps
>((props$) => {
  const dl = container.get<DataLayer>(DataLayerType);
  const id$ = (props$ as Observable<ServicesQuotaOverviewDetailProps>).pipe(
    map((props) => props.id),
    distinctUntilChanged()
  );

  const serviceTree$ = (props$ as Observable<
    ServicesQuotaOverviewDetailProps
  >).pipe(
    map((props) => props.serviceTree),
    distinctUntilChanged()
  );

  const getRootGroupId = (id: string) => {
    return "/" + id.split("/")[1];
  };

  const quotaGroupQuery = (id: string) =>
    dl.query(
      gql`
        query {
          group(id: $id) {
            id
            name
            quota
          }
        }
      `,
      { id: getRootGroupId(id), mesosStateStore: MesosStateStore }
    );

  const group$ = id$.pipe(
    switchMap((id) => quotaGroupQuery(id)),
    map(({ data: { group } }) => group)
  );

  return combineLatest(group$, serviceTree$).pipe(
    map(([group, serviceTree]) => {
      if (!group) {
        return <Loader />;
      }

      return (
        <React.Fragment>
          {getNoLimitInfobox(group)}
          <div className="quota-details">
            {getCard(group, "cpus")}
            {getCard(group, "memory")}
            {getCard(group, "disk")}
            {getCard(group, "gpus")}
          </div>
          <ServicesQuotaOverviewTable serviceTree={serviceTree} />
        </React.Fragment>
      );
    }),
    catchError(() => of(<Trans>Error getting group with Quota</Trans>))
  );
});

export default ServicesQuotaOverviewDetail;
