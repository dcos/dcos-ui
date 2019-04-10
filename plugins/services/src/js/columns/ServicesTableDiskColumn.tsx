import * as React from "react";
import { NumberCell } from "@dcos/ui-kit";
import { WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";

import TableColumnResizeStore from "#SRC/js/stores/TableColumnResizeStore";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import Units from "#SRC/js/utils/Units";
import { columnWidthsStorageKey } from "../containers/services/ServicesTable";

export const ServiceDisk = React.memo(({ resource }: { resource: string }) => (
  <NumberCell>
    <span>{Units.formatResource("disk", resource)}</span>
  </NumberCell>
));

export function diskRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  return <ServiceDisk resource={service.getResources()[`disk`]} />;
}

export function diskWidth(_: WidthArgs) {
  return TableColumnResizeStore.get(columnWidthsStorageKey).disk;
}
