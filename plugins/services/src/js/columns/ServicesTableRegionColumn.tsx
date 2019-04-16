import * as React from "react";
import { TextCell } from "@dcos/ui-kit";
import { Tooltip } from "reactjs-components";

import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import { SortDirection } from "plugins/services/src/js/types/SortDirection";
import ServiceTableUtil from "../utils/ServiceTableUtil";

const ServiceRegion = React.memo(({ regions }: { regions: string }) => (
  <TextCell>
    <Tooltip elementTag="span" wrapText={true} content={regions}>
      {regions}
    </Tooltip>
  </TextCell>
));

export function regionRendererFactory(localRegion: string | undefined) {
  return (service: Service | Pod | ServiceTree) => {
    let regions: string[] = service.getRegions();

    regions = regions.map(region =>
      region === localRegion ? region + " (Local)" : region
    );

    if (regions.length === 0) {
      regions.push("N/A");
    }

    return <ServiceRegion regions={regions.join(", ")} />;
  };
}
export function regionSorter(
  data: Array<Service | Pod | ServiceTree>,
  sortDirection: SortDirection
): any {
  return ServiceTableUtil.sortData(data, sortDirection, "region");
}
