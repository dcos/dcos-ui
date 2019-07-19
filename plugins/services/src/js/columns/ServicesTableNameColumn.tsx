import * as React from "react";
import { TextCell, Icon, Badge } from "@dcos/ui-kit";
import { Link } from "react-router";
import { Trans } from "@lingui/macro";

import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  greyDark,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";

import NestedServiceLinks from "#SRC/js/components/NestedServiceLinks";
import TableColumnResizeStore from "#SRC/js/stores/TableColumnResizeStore";
import ServiceTree from "../structs/ServiceTree";
import Service from "../structs/Service";
import Pod from "../structs/Pod";
import { columnWidthsStorageKey } from "../containers/services/ServicesTable";

const ServiceName = React.memo(
  ({
    isFiltered,
    hasQuota,
    id,
    isGroup,
    isNoLimit,
    name,
    image,
    webUrl
  }: {
    isFiltered: boolean;
    hasQuota: boolean;
    id: string;
    isGroup: boolean;
    isNoLimit: boolean;
    name: string;
    image: string | null;
    webUrl: string | null;
  }) => {
    const serviceLink = isGroup
      ? `/services/overview/${id}`
      : `/services/detail/${id}`;

    const badge =
      hasQuota && isNoLimit ? (
        <Badge>
          <Trans render="span" className="quota-no-limit">
            No Limit
          </Trans>
        </Badge>
      ) : null;

    return (
      <TextCell>
        <div className="service-table-heading flex-box flex-box-align-vertical-center table-cell-flex-box text-overflow">
          <Link className="table-cell-icon" to={serviceLink}>
            {getImage(image, isGroup)}
          </Link>
          <span
            className="table-cell-value table-cell-flex-box"
            style={{ marginRight: "7px" }}
          >
            {getServiceLink(id, name, isGroup, isFiltered)}
            {getOpenInNewWindowLink(webUrl)}
          </span>
          {badge}
        </div>
      </TextCell>
    );
  }
);

export function nameRenderer(
  isFiltered: boolean,
  hasQuota: boolean,
  service: Service | Pod | ServiceTree
): React.ReactNode {
  // These do not work with instanceof ServiceTree due to TS
  const image =
    service instanceof Pod || service instanceof Service
      ? service.getImages()["icon-small"]
      : null;
  const webUrl =
    service instanceof Pod || (service instanceof Service && hasWebUI(service))
      ? service.getWebURL()
      : null;

  const IDArray = service.getId().split("/");
  // If the service is in a top-level group,
  // IDArray would look like ["","group-name","service-name"]

  const isNoLimit =
    service instanceof Pod || service instanceof Service
      ? IDArray.length > 2 &&
        service.getRole() !== IDArray[1] &&
        service.getName() === IDArray[2]
      : false;

  return (
    <ServiceName
      id={encodeURIComponent(service.getId().toString())}
      isGroup={service instanceof ServiceTree}
      isNoLimit={isNoLimit}
      name={service.getName()}
      image={image}
      webUrl={webUrl}
      isFiltered={isFiltered}
      hasQuota={hasQuota}
    />
  );
}

function getImage(image: string | null, isGroup: boolean): React.ReactNode {
  if (isGroup) {
    // Get serviceTree image/icon
    return (
      <span className="icon-margin-right">
        <Icon color={greyDark} shape={SystemIcons.Folder} size={iconSizeXs} />
      </span>
    );
  }

  // Get service image/icon
  return (
    <span className="icon icon-mini icon-image-container icon-app-container icon-margin-right">
      <img src={image as string} />
    </span>
  );
}

function getServiceLink(
  id: string,
  name: string,
  isGroup: boolean,
  isFiltered: boolean
): React.ReactNode {
  const serviceLink = isGroup
    ? `/services/overview/${id}`
    : `/services/detail/${id}`;
  if (isFiltered) {
    return (
      <NestedServiceLinks
        serviceLink={serviceLink}
        serviceID={id}
        className="service-breadcrumb"
        majorLinkClassName="service-breadcrumb-service-id"
        minorLinkWrapperClassName="service-breadcrumb-crumb"
      />
    );
  }

  return (
    <Link className="table-cell-link-primary" to={serviceLink}>
      {name}
    </Link>
  );
}

function getOpenInNewWindowLink(webUrl: string | null): React.ReactNode {
  // This might be a serviceTree and therefore we need this check
  // And getWebURL might therefore not be available
  if (!webUrl) {
    return null;
  }

  return (
    <a
      className="table-cell-icon table-display-on-row-hover"
      href={webUrl}
      target="_blank"
      title="Open in a new window"
    >
      <span className="icon-margin-left">
        <Icon
          color={greyDark}
          shape={SystemIcons.OpenExternal}
          size={iconSizeXs}
        />
      </span>
    </a>
  );
}

function hasWebUI(service: any): any {
  return (
    service instanceof Service &&
    service.getWebURL() != null &&
    service.getWebURL() !== ""
  );
}

export function nameWidth(_: WidthArgs) {
  return TableColumnResizeStore.get(columnWidthsStorageKey).name;
}
