import * as React from "react";
import { Trans } from "@lingui/macro";
import { NumberCell, Tooltip } from "@dcos/ui-kit";

import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import Units from "#SRC/js/utils/Units";
import { getResourceLimits } from "./resourceLimits";

export const ServiceCPU = React.memo(
  ({
    resource,
    limit,
    id,
  }: {
    resource: string;
    limit?: number | string;
    id: string;
  }) => {
    if (limit != null && limit !== 0 && limit !== resource) {
      return (
        <NumberCell>
          <Tooltip
            id={`cpu${id}`}
            trigger={Units.formatResources("cpus", resource, limit)}
            maxWidth={150}
          >
            <Trans
              id="{resource} cpus are being guaranteed with a limit of {limit} cpus"
              render="span"
              values={{
                resource: Units.formatResource("cpus", resource),
                limit: Units.formatResource("cpus", limit),
              }}
            />
          </Tooltip>
        </NumberCell>
      );
    }
    return (
      <NumberCell>
        <span>{Units.formatResource("cpus", resource)}</span>
      </NumberCell>
    );
  }
);

type TreeItem = Service | Pod | ServiceTree;
export const cpuRenderer = (service: TreeItem): React.ReactNode => (
  <ServiceCPU
    id={service.getId()}
    resource={service.getResources().cpus}
    limit={getResourceLimits(service).cpus}
  />
);
