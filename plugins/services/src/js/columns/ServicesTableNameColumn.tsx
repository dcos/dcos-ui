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

const ServiceName = React.memo(
  ({
    isFiltered,
    id,
    isGroup,
    linkToQuota,
    name,
    image,
    webUrl
  }: {
    isFiltered: boolean;
    id: string;
    isGroup: boolean;
    linkToQuota: boolean;
    name: string;
    image: string | null;
    webUrl: string | null;
  }) => {
    const serviceLink = isGroup
      ? linkToQuota
        ? `/services/quota/${id}`
        : `/services/overview/${id}`
      : `/services/detail/${id}`;

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
            {getServiceLink(id, name, isGroup, linkToQuota, isFiltered)}
            {getOpenInNewWindowLink(webUrl)}
          </span>
        </div>
      </TextCell>
    );
  }
);

export function nameRenderer(
  isFiltered: boolean,
  linkToQuota: boolean,
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
      linkToQuota={linkToQuota}
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
  linkToQuota: boolean,
  isFiltered: boolean
): React.ReactNode {
  const serviceLink = isGroup
    ? linkToQuota
      ? `/services/quota/${id}`
      : `/services/overview/${id}`
    : `/services/detail/${id}`;

  if (isFiltered) {
    return <NestedServiceLinks serviceLink={serviceLink} serviceID={id} />;
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
