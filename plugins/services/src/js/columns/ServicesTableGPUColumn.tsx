import * as React from "react";
import { NumberCell } from "@dcos/ui-kit";
import { WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";

import TableColumnResizeStore from "#SRC/js/stores/TableColumnResizeStore";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import Units from "#SRC/js/utils/Units";
import { SortDirection } from "plugins/services/src/js/types/SortDirection";
import ServiceTableUtil from "../utils/ServiceTableUtil";
// import { columnWidthsStorageKey } from "../containers/services/ServicesTable";
const columnWidthsStorageKey = "servicesTableColWidths";

export const ServiceGPU = React.memo(({ resource }: { resource: string }) => (
  <NumberCell>
    <span>{Units.formatResource("gpus", resource)}</span>
  </NumberCell>
));

export function gpuRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  return <ServiceGPU resource={service.getResources()[`gpus`]} />;
}

export function gpuSorter(
  data: Array<Service | Pod | ServiceTree>,
  sortDirection: SortDirection
): any {
  return ServiceTableUtil.sortData(data, sortDirection, "gpus");
}

export function gpuWidth(_: WidthArgs) {
  return TableColumnResizeStore.get(columnWidthsStorageKey).gpu;
}
