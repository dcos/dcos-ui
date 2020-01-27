import * as React from "react";
import { NumberCell } from "@dcos/ui-kit";

import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import Units from "#SRC/js/utils/Units";

export const ServiceCPU = React.memo(
  ({ resource, limit }: { resource: string; limit?: number | string }) => (
    <NumberCell>
      <span>
        {Units.formatResource("cpus", resource)}
        {limit != null && limit !== 0 ? (
          <React.Fragment> / {limit}</React.Fragment>
        ) : null}
      </span>
    </NumberCell>
  )
);

export function cpuRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  return (
    <ServiceCPU
      resource={service.getResources()[`cpus`]}
      limit={service.getResourceLimits()[`cpus`]}
    />
  );
}
