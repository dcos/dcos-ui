import { i18nMark } from "@lingui/react";

const VolumeStatus = {
  ATTACHED: i18nMark("Attached"),
  DETACHED: i18nMark("Detached"),
  UNAVAILABLE: i18nMark("N/A"),
};

export const statusFromVolume = (volume) =>
  volume.status || VolumeStatus.UNAVAILABLE;

export default VolumeStatus;
