import { MountService } from "foundation-ui";

import VolumeMountTypesSelect from "./components/VolumeMountTypesSelect";
import VolumeTypeSelect from "./components/VolumeTypeSelect";
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
    MountService.MountService.registerComponent(
      VolumeMountTypesSelect,
      "CreateService:MultiContainerVolumes:Types"
    );
    MountService.MountService.registerComponent(
      VolumeTypeSelect,
      "CreateService:SingleContainerVolumes:Types"
    );
  }
};
