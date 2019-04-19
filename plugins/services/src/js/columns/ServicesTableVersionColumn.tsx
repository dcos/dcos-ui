import * as React from "react";
import { TextCell } from "@dcos/ui-kit";
import { Tooltip } from "reactjs-components";
import { WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";

import TableColumnResizeStore from "#SRC/js/stores/TableColumnResizeStore";
import ServiceTableUtil from "../utils/ServiceTableUtil";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import { SortDirection } from "plugins/services/src/js/types/SortDirection";
// import { columnWidthsStorageKey } from "../containers/services/ServicesTable";
const columnWidthsStorageKey = "servicesTableColWidths";

const ServiceVersion = React.memo(
  ({
    rawVersion,
    displayVersion
  }: {
    rawVersion: string;
    displayVersion: string;
  }) => (
    <TextCell>
      <Tooltip content={rawVersion} wrapText={true}>
        {displayVersion}
      </Tooltip>
    </TextCell>
  )
);

export function versionRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  const version = ServiceTableUtil.getFormattedVersion(service);
  if (!version) {
    return null;
  }

  return (
    <ServiceVersion
      rawVersion={version.rawVersion}
      displayVersion={version.displayVersion}
    />
  );
}

export function versionSorter(
  data: Array<Service | Pod | ServiceTree>,
  sortDirection: SortDirection
): any {
  return ServiceTableUtil.sortData(data, sortDirection, "version");
}

export function versionWidth(_: WidthArgs) {
  return TableColumnResizeStore.get(columnWidthsStorageKey).version;
}
