import * as React from "react";
import { NumberCell } from "@dcos/ui-kit";

import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import Units from "#SRC/js/utils/Units";
import { SortDirection } from "plugins/services/src/js/types/SortDirection";
import ServiceTableUtil from "../utils/ServiceTableUtil";

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

export function diskSorter(
  data: Array<Service | Pod | ServiceTree>,
  sortDirection: SortDirection
): any {
  return ServiceTableUtil.sortData(data, sortDirection, "disk");
}
