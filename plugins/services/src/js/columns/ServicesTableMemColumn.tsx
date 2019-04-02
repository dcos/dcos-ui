import * as React from "react";
import { NumberCell } from "@dcos/ui-kit";

import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import Units from "#SRC/js/utils/Units";
import { SortDirection } from "plugins/services/src/js/types/SortDirection";
import ServiceTableUtil from "../utils/ServiceTableUtil";

export function memRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  const resource = service.getResources()[`mem`];
  return (
    <NumberCell>
      <span>{Units.formatResource("mem", resource)}</span>
    </NumberCell>
  );
}

export function memSorter(
  data: Array<Service | Pod | ServiceTree>,
  sortDirection: SortDirection
): any {
  return ServiceTableUtil.sortData(data, sortDirection, "mem");
}
