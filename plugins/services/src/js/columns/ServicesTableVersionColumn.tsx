import * as React from "react";
import { TextCell } from "@dcos/ui-kit";
import { Tooltip } from "reactjs-components";

// @ts-ignore
import Framework from "../structs/Framework";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import * as Version from "../utils/Version";

const ServiceVersion = React.memo(
  ({
    rawVersion,
    displayVersion
  }: {
    rawVersion: string;
    displayVersion: string;
  }) => (
    <TextCell>
      <Tooltip content={rawVersion} wrapText={true}>
        {displayVersion}
      </Tooltip>
    </TextCell>
  )
);

export function versionRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  if (service instanceof ServiceTree) {
    return null;
  }

  const rawVersion = Version.fromService(service);
  const displayVersion =
    service instanceof Framework ? Version.toDisplayVersion(rawVersion) : "";

  return (
    <ServiceVersion rawVersion={rawVersion} displayVersion={displayVersion} />
  );
}
