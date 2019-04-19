import * as React from "react";
import { TextCell, Icon } from "@dcos/ui-kit";
import { Link } from "react-router";
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
import { SortDirection } from "plugins/services/src/js/types/SortDirection";
import ServiceTableUtil from "../utils/ServiceTableUtil";
// import { columnWidthsStorageKey } from "../containers/services/ServicesTable";
const columnWidthsStorageKey = "servicesTableColWidths";

const ServiceName = React.memo(
  ({
    isFiltered,
    id,
    isGroup,
    name,
    image,
    webUrl
  }: {
    isFiltered: boolean;
    id: string;
    isGroup: boolean;
    name: string;
    image: string | null;
    webUrl: string | null;
  }) => {
    const serviceLink = isGroup
      ? `/services/overview/${id}`
      : `/services/detail/${id}`;

    return (
      <TextCell>
        <div className="service-table-heading flex-box flex-box-align-vertical-center table-cell-flex-box text-overflow">
          <Link className="table-cell-icon" to={serviceLink}>
            {getImage(image, isGroup)}
          </Link>
          <span className="table-cell-value table-cell-flex-box">
            {getServiceLink(id, name, isGroup, isFiltered)}
            {getOpenInNewWindowLink(webUrl)}
          </span>
        </div>
      </TextCell>
    );
  }
);

export function nameRenderer(
  isFiltered: boolean,
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

  return (
    <ServiceName
      id={encodeURIComponent(service.getId().toString())}
      isGroup={service instanceof ServiceTree}
      name={service.getName()}
      image={image}
      webUrl={webUrl}
      isFiltered={isFiltered}
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

export function nameSorter(
  data: Array<Service | Pod | ServiceTree>,
  sortDirection: SortDirection
): any {
  return ServiceTableUtil.sortData(data, sortDirection, "name");
}

export function nameWidth(_: WidthArgs) {
  return TableColumnResizeStore.get(columnWidthsStorageKey).name;
}
