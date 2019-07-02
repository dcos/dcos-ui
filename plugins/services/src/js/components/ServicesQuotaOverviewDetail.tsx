import React from "react";
import { Trans } from "@lingui/macro";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import ProgressBar from "#SRC/js/components/ProgressBar";
import * as ResourcesUtil from "#SRC/js/utils/ResourcesUtil";
import Loader from "#SRC/js/components/Loader";

import { ServiceGroup, QuotaResources } from "../types/ServiceGroup";

export interface ServicesQuotaOverviewDetailProps {
  group: ServiceGroup;
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

class ServicesQuotaOverviewDetail extends React.Component<
  ServicesQuotaOverviewDetailProps,
  {}
> {
  constructor(props: Readonly<ServicesQuotaOverviewDetailProps>) {
    super(props);

    this.getCard = this.getCard.bind(this);
  }

  getCard(resource: string): React.ReactNode {
    const { group } = this.props;

    const title =
      resource === "cpus" || resource === "gpus"
        ? resource.slice(0, -1).toUpperCase()
        : resource[0].toUpperCase() + resource.slice(1);
    const percent = getQuotaPercentage(group, resource);
    const className = `color-${ResourcesUtil.getResourceColor(
      resource === "memory" ? "mem" : resource
    )}`;

    return (
      <div className="panel quota-card">
        <div className="panel-content">
          <div className="quota-card-title">
            <div className="panel-header panel-cell panel-cell-light panel-cell-narrow panel-cell-shorter">
              <Trans
                id={title}
                render="h2"
                className="flush text-align-center"
              />
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

  render() {
    if (!this.props.group) {
      return <Loader />;
    }

    return (
      <div className="quota-details">
        {this.getCard("cpus")}
        {this.getCard("memory")}
        {this.getCard("disk")}
        {this.getCard("gpus")}
      </div>
    );
  }
}

export default ServicesQuotaOverviewDetail;
