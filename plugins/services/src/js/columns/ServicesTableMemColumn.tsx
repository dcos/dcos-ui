import * as React from "react";
import { NumberCell } from "@dcos/ui-kit";

import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import Units from "#SRC/js/utils/Units";

export const ServiceMem = React.memo(
  ({
    resource,
    limit
  }: {
    resource: string;
    limit: number | string | null;
  }) => (
    <NumberCell>
      <span>
        {Units.formatResource("mem", resource)}
        {limit != null && limit !== 0 ? (
          <React.Fragment>
            {" "}
            / {Units.formatResource("mem", limit)}
          </React.Fragment>
        ) : null}
      </span>
    </NumberCell>
  )
);

export function memRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  return (
    <ServiceMem
      resource={service.getResources()[`mem`]}
      limit={service.getResourceLimits()[`mem`]}
    />
  );
}
