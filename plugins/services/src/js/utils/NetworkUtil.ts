import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import Networking from "#SRC/js/constants/Networking";

const { HOST } = Networking.type;

export const isHostNetwork = (data: object) => {
  const networkType =
    findNestedPropertyInObject(data, "networks.0.mode") || HOST;

  return networkType === HOST;
};

export const getHostPortPlaceholder = (
  identifier: string | number,
  isPod?: boolean
) => {
  let podPlaceholder = "$ENDPOINT_{NAME}";
  if (identifier && typeof identifier === "string") {
    podPlaceholder = podPlaceholder.replace("{NAME}", identifier.toUpperCase());
  }

  return isPod ? podPlaceholder : `$PORT${identifier}`;
};
