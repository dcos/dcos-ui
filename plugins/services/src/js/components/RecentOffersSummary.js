import { Trans } from "@lingui/macro";
import classNames from "classnames";
import React from "react";
import { Tooltip } from "reactjs-components";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  greyLightDarken1,
  iconSizeS
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import Config from "#SRC/js/config/Config";
import Units from "#SRC/js/utils/Units";
import MetadataStore from "#SRC/js/stores/MetadataStore";

const displayedResourceValues = {
  roles: <Trans>Role</Trans>,
  constraints: <Trans>Constraints</Trans>,
  cpus: <Trans>CPU</Trans>,
  gpus: <Trans>GPU</Trans>,
  mem: <Trans>Memory</Trans>,
  disk: <Trans>Disk</Trans>,
  ports: <Trans>Ports</Trans>
};

const MAX_BAR_HEIGHT = 200;

function getGraphBar(resource, data, index) {
  const resourceOfferSummary = data[resource] || { offers: 0, matched: 0 };
  const matchedOffers = resourceOfferSummary.matched;
  const offeredCount = resourceOfferSummary.offers;
  let percentageMatched = null;
  let percentageOffered = null;

  // Avoid NaN and infinite values from division by zero.
  if (offeredCount === 0) {
    percentageMatched = 0;
  } else {
    percentageMatched = matchedOffers / offeredCount;
  }

  if (data.roles.offers === 0 || offeredCount === 0) {
    percentageOffered = 0;
  } else {
    percentageOffered = offeredCount / data.roles.offers;
  }

  const barGraphMatchedClasses = classNames("funnel-graph-item-bar-matched", {
    "funnel-graph-item-bar-matched-border-top":
      percentageMatched > 0 && percentageMatched < 1
  });

  const offeredHeight = Math.ceil(MAX_BAR_HEIGHT * percentageOffered);
  const matchedHeight = Math.ceil(offeredHeight * percentageMatched);

  return (
    <Tooltip
      content={getResourceTooltipContent(resource, data)}
      interactive={true}
      key={index}
      width={200}
      wrapText={true}
      wrapperClassName="funnel-graph-item"
    >
      <div className="funnel-graph-item-bar">
        <div className="funnel-graph-item-percentage">
          {Math.ceil(percentageMatched * 100)}%
        </div>
        <div
          className="funnel-graph-item-bar-offered"
          style={{ flexBasis: `${offeredHeight}px` }}
        >
          <div
            className={barGraphMatchedClasses}
            style={{ flexBasis: `${matchedHeight}px` }}
          />
        </div>
      </div>
      <div className="funnel-graph-item-label">
        <div className="funnel-graph-item-label-primary">
          {displayedResourceValues[resource]}
        </div>
        <div className="funnel-graph-item-label-secondary small flush-bottom">
          {Units.contractNumber(resourceOfferSummary.matched)}/
          {Units.contractNumber(resourceOfferSummary.offers)}
        </div>
      </div>
    </Tooltip>
  );
}

function getGraphSpacer({ key, showIcon = true }) {
  let icon = null;

  if (showIcon) {
    icon = (
      <Icon
        shape={SystemIcons.CaretRight}
        size={iconSizeS}
        color={greyLightDarken1}
      />
    );
  }

  return (
    <div className="funnel-graph-item-spacer" key={key}>
      {icon}
      <div className="funnel-graph-item-label" />
    </div>
  );
}

function getResourceTooltipContent(resource, data) {
  let { matched, offers, requested: requestedValue } = data[resource] || {
    offers: 0,
    matched: 0
  };
  let docsURI = null;
  let explanatoryText = null;

  if (matched === 0) {
    explanatoryText = <Trans render="span">did not match</Trans>;
  } else if (matched >= offers) {
    explanatoryText = <Trans render="span">matched</Trans>;
  } else {
    explanatoryText = <Trans render="span">partially matched</Trans>;
  }

  if (resource === "roles") {
    docsURI = `${Config.mesosDocsURI}roles/`;
    explanatoryText = (
      <span>
        <Trans render="span">The resource offer</Trans> {explanatoryText}{" "}
        <Trans render="span">your service's role ({requestedValue}).</Trans>
      </span>
    );
  }

  if (resource === "constraints") {
    docsURI = MetadataStore.buildDocsURI(
      "/deploying-services/marathon-constraints"
    );
    explanatoryText = (
      <span>
        <Trans render="span">The resource offer</Trans> {explanatoryText}{" "}
        <Trans render="span">
          your service's requirements ({requestedValue}).
        </Trans>
      </span>
    );
  }

  if (resource === "cpus") {
    docsURI = `${Config.mesosDocsURI}attributes-resources/`;
    explanatoryText = (
      <span>
        <Trans render="span">The CPUs offered</Trans> {explanatoryText}{" "}
        <Trans render="span">
          your service's requirements ({requestedValue}).
        </Trans>
      </span>
    );
  }

  if (resource === "gpus") {
    docsURI = `${Config.mesosDocsURI}attributes-resources/`;
    explanatoryText = (
      <span>
        <Trans render="span">The GPUs offered</Trans> {explanatoryText}{" "}
        <Trans render="span">
          your service's requirements ({requestedValue}).
        </Trans>
      </span>
    );
  }

  if (resource === "mem") {
    requestedValue = Units.formatResource(resource, requestedValue);
    docsURI = `${Config.mesosDocsURI}attributes-resources/`;
    explanatoryText = (
      <span>
        <Trans render="span">The memory offered</Trans> {explanatoryText}{" "}
        <Trans render="span">
          your service's requirements ({requestedValue}).
        </Trans>
      </span>
    );
  }

  if (resource === "disk") {
    requestedValue = Units.formatResource(resource, requestedValue);
    explanatoryText = (
      <span>
        <Trans render="span">The disk space offered</Trans> {explanatoryText}{" "}
        <Trans render="span">
          your service's requirements ({requestedValue}).
        </Trans>
      </span>
    );
    docsURI = `${Config.mesosDocsURI}attributes-resources/`;
  }

  if (resource === "ports") {
    explanatoryText = (
      <span>
        <Trans render="span">The port offered</Trans> {explanatoryText}{" "}
        <Trans render="span">
          your service's requirements ({requestedValue}).
        </Trans>
      </span>
    );
    docsURI = `${Config.mesosDocsURI}attributes-resources/`;
  }

  return (
    <span>
      {explanatoryText}{" "}
      <a href={docsURI} target="_blank">
        <Trans render="span">Learn more</Trans>
      </a>.
    </span>
  );
}

function RecentOffersSummary({ data }) {
  const funnelItems = [
    "roles",
    "constraints",
    "cpus",
    "mem",
    "disk",
    "gpus",
    "ports"
  ];
  const funnelGraphItems = funnelItems.reduce((accumulator, item, index) => {
    accumulator.push(getGraphBar(item, data, index));

    if (index < funnelItems.length - 1) {
      accumulator.push(getGraphSpacer({ key: `spacer-${index}` }));
    }

    return accumulator;
  }, []);

  funnelGraphItems.unshift(
    getGraphSpacer({ key: "graph-start", showIcon: false })
  );

  funnelGraphItems.push(getGraphSpacer({ key: "graph-end", showIcon: false }));

  return (
    <div className="funnel-graph pod flush-horizontal">
      <div className="funnel-graph-bars">{funnelGraphItems}</div>
      <div className="funnel-graph-key">
        <div className="funnel-graph-key-item">
          <span className="funnel-graph-key-dot funnel-graph-key-dot-matched dot" />
          <Trans render="span">Matched</Trans>
        </div>
        <div className="funnel-graph-key-item">
          <span className="funnel-graph-key-dot funnel-graph-key-dot-declined dot" />
          <Trans render="span">Declined</Trans>
        </div>
      </div>
    </div>
  );
}

export default RecentOffersSummary;
