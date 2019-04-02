import * as React from "react";
import { NumberCell } from "@dcos/ui-kit";

import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import Units from "#SRC/js/utils/Units";
import { SortDirection } from "plugins/services/src/js/types/SortDirection";
import ServiceTableUtil from "../utils/ServiceTableUtil";

export function cpuRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  const resource = service.getResources()[`cpus`];

  return (
    <NumberCell>
      <span>{Units.formatResource("cpus", resource)}</span>
    </NumberCell>
  );
}

export function cpuSorter(
  data: Array<Service | Pod | ServiceTree>,
  sortDirection: SortDirection
): any {
  return ServiceTableUtil.sortData(data, sortDirection, "cpus");
}
