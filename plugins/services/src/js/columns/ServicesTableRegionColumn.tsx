import * as React from "react";
import { TextCell } from "@dcos/ui-kit";
import { Tooltip } from "reactjs-components";
import { WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";

import TableColumnResizeStore from "#SRC/js/stores/TableColumnResizeStore";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import { columnWidthsStorageKey } from "../containers/services/ServicesTable";

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

export function regionWidth(_: WidthArgs) {
  return TableColumnResizeStore.get(columnWidthsStorageKey).region;
}
