import { i18nMark } from "@lingui/react";

const VolumeProfile = {
  UNAVAILABLE: i18nMark("Not Available")
};

export default VolumeProfile;

export const profileFromVolume = volume =>
  volume.profileName || VolumeProfile.UNAVAILABLE;
