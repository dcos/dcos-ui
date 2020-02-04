import * as React from "react";
import { TextCell } from "@dcos/ui-kit";
import { Tooltip } from "reactjs-components";

import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";

const emptyRegionPlaceholder = "N/A";

const ServiceRegion = React.memo(({ regions }: { regions: string }) => (
  <TextCell>
    {regions === emptyRegionPlaceholder ? (
      regions
    ) : (
      <Tooltip elementTag="span" wrapText={true} content={regions}>
        {regions}
      </Tooltip>
    )}
  </TextCell>
));

export function regionRendererFactory(localRegion: string | undefined) {
  return (service: Service | Pod | ServiceTree) => {
    let regions: string[] = service.getRegions();

    regions = regions.map(region =>
      region === localRegion ? region + " (Local)" : region
    );

    if (regions.length === 0) {
      regions.push(emptyRegionPlaceholder);
    }

    return <ServiceRegion regions={regions.join(", ")} />;
  };
}
