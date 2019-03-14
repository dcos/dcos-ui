import * as React from "react";
import { TextCell, Icon } from "@dcos/ui-kit";
import { Link } from "react-router";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  greyDark,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import NestedServiceLinks from "#SRC/js/components/NestedServiceLinks";
import ServiceTree from "../structs/ServiceTree";
import Service from "../structs/Service";
import Pod from "../structs/Pod";
import { SortDirection } from "plugins/services/src/js/types/SortDirection";
import ServiceTableUtil from "../utils/ServiceTableUtil";

export function nameRenderer(
  isFiltered: boolean,
  service: Service | Pod | ServiceTree
): React.ReactNode {
  const id: string = encodeURIComponent(service.getId().toString());
  const isGroup = service instanceof ServiceTree;
  const serviceLink = isGroup
    ? `/services/overview/${id}`
    : `/services/detail/${id}`;

  return (
    <TextCell>
      <div className="service-table-heading flex-box flex-box-align-vertical-center table-cell-flex-box text-overflow">
        <Link className="table-cell-icon" to={serviceLink}>
          {getImage(service)}
        </Link>
        <span className="table-cell-value table-cell-flex-box">
          {getServiceLink(service, isFiltered)}
          {getOpenInNewWindowLink(service)}
        </span>
      </div>
    </TextCell>
  );
}

function getImage(service: any): any {
  if (service instanceof ServiceTree) {
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
      <img src={service.getImages()["icon-small"]} />
    </span>
  );
}

function getServiceLink(service: any, isFiltered: boolean): any {
  const id = encodeURIComponent(service.getId());
  const isGroup = service instanceof ServiceTree;
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
      {service.getName()}
    </Link>
  );
}

function getOpenInNewWindowLink(service: any): any {
  // This might be a serviceTree and therefore we need this check
  // And getWebURL might therefore not be available
  if (!hasWebUI(service)) {
    return null;
  }

  return (
    <a
      className="table-cell-icon table-display-on-row-hover"
      href={service.getWebURL()}
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

export function nameSorter(
  data: Array<Service | Pod | ServiceTree>,
  sortDirection: SortDirection
): any {
  return ServiceTableUtil.sortData(data, sortDirection, "name");
}
