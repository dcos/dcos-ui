import { i18nMark } from "@lingui/react";

export const DSS = {
  name: i18nMark("DC/OS Storage Volume"),
  type: "DC/OS",
  description: i18nMark(
    "A locally persistent volume pre-created by the operator according to a storage profile."
  ),
};
export const PERSISTENT = {
  name: i18nMark("Local Persistent Volume"),
  type: "Persistent",
  description: i18nMark(
    "A locally persistent volume based upon the physical disks installed in the agent which has the capabilities of a single disk."
  ),
  recommended: true,
};
export const EXTERNAL = {
  name: i18nMark("External Persistent Volume"),
  type: "External",
  description: i18nMark(
    "A REX-Ray backed volume that is mounted on the agent from network attached storage."
  ),
};
export const EXTERNAL_CSI = {
  name: i18nMark("External Persistent CSI Volume"),
  type: "ExternalCSI",
  description: i18nMark(
    "A CSI-backed volume that is mounted on the agent from network attached storage."
  ),
};
export const HOST = {
  name: i18nMark("Host Volume"),
  type: "Host",
  description: i18nMark(
    "A host volume is a directory on the the local agent mapped to one in a container."
  ),
};
export const EPHEMERAL = {
  name: i18nMark("Ephemeral Storage"),
  type: "Ephemeral",
  description: i18nMark(
    "Mesos default for allocating temporary disk space to a service. Enough for many stateless or semi-stateless 12-factor and cloud native applications."
  ),
};

export default {
  DSS,
  PERSISTENT,
  EXTERNAL,
  EXTERNAL_CSI,
  HOST,
  EPHEMERAL,
};
