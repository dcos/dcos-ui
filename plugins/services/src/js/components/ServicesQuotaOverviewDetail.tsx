import { Trans } from "@lingui/macro";
import React from "react";
import { of, Observable } from "rxjs";
import {
  map,
  catchError,
  distinctUntilChanged,
  switchMap
} from "rxjs/operators";
import { componentFromStream } from "@dcos/data-service";
import gql from "graphql-tag";
import { DataLayer, DataLayerType } from "@extension-kid/data-layer";

import Loader from "#SRC/js/components/Loader";
import container from "#SRC/js/container";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import ProgressBar from "#SRC/js/components/ProgressBar";
import * as ResourcesUtil from "#SRC/js/utils/ResourcesUtil";

import { ServiceGroup, QuotaResources } from "../types/ServiceGroup";

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

  return (resourceQuota.consumed / resourceQuota.limit) * 100;
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

  if (resource === "cpus" || resource === "gpus") {
    return (
      <Trans>
        {resourceQuota.consumed} of {resourceQuota.limit} Cores
      </Trans>
    );
  }
  return (
    <Trans>
      {resourceQuota.consumed} of {resourceQuota.limit} MiB
    </Trans>
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

export interface ServicesQuotaOverviewDetailProps {
  id: string;
}

const ServicesQuotaOverviewDetail = componentFromStream<
  ServicesQuotaOverviewDetailProps
>(props$ => {
  const dl = container.get<DataLayer>(DataLayerType);
  const id$ = (props$ as Observable<ServicesQuotaOverviewDetailProps>).pipe(
    map(props => props.id),
    distinctUntilChanged()
  );

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
      { id }
    );

  const group$ = id$.pipe(
    switchMap(id => quotaGroupQuery(id)),
    map(({ data: { group } }) => group)
  );

  return group$.pipe(
    map(group => {
      if (!group) {
        return <Loader />;
      }

      return (
        <div className="quota-details">
          {getCard(group, "cpus")}
          {getCard(group, "memory")}
          {getCard(group, "disk")}
          {getCard(group, "gpus")}
        </div>
      );
    }),
    catchError(() => of(<Trans>Error getting group with Quota</Trans>))
  );
});

export default ServicesQuotaOverviewDetail;
