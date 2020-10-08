import { MountService } from "foundation-ui";

import DSSInput from "./components/DSSInput";
import DSSVolumeConfig from "./components/DSSVolumeConfig";

module.exports = {
  initialize() {
    MountService.MountService.registerComponent(
      DSSVolumeConfig,
      "CreateService:SingleContainerVolumes:UnknownVolumes"
    );
    MountService.MountService.registerComponent(
      DSSInput,
      "CreateService:MultiContainerVolumes:UnknownVolumes"
    );
  },
};
