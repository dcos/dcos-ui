import { TextCell } from "@dcos/ui-kit";
import * as React from "react";
import { Tooltip } from "reactjs-components";
import Framework from "../structs/Framework";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import * as Version from "../utils/Version";

const ServiceVersion = React.memo(({ rawVersion }: { rawVersion: string }) => (
  <TextCell>
    <Tooltip content={rawVersion} wrapText={true}>
      {rawVersion}
    </Tooltip>
  </TextCell>
));

export function versionRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  if (service instanceof ServiceTree) {
    return null;
  }

  const rawVersion =
    service instanceof Framework ? Version.fromService(service) : "";
  return <ServiceVersion rawVersion={rawVersion} />;
}
