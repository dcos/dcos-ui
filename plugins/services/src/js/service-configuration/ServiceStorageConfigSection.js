import { formatResource } from "#SRC/js/utils/Units";
import Util from "#SRC/js/utils/Util";
import VolumeDefinitions
  from "#PLUGINS/services/src/js/constants/VolumeDefinitions";
import VolumeConstants
  from "#PLUGINS/services/src/js/constants/VolumeConstants";

import { getDisplayValue } from "../utils/ServiceConfigDisplayUtil";
import ServiceConfigBaseSectionDisplay from "./ServiceConfigBaseSectionDisplay";

class ServiceStorageConfigSection extends ServiceConfigBaseSectionDisplay {
  /**
   * @override
   */
  shouldExcludeItem() {
    const { appConfig } = this.props;

    return !Util.findNestedPropertyInObject(
      appConfig,
      "container.volumes.length"
    );
  }

  /**
   * @override
   */
  getMountType() {
    return "CreateService:ServiceConfigDisplay:App:Storage";
  }

  getVolumeSizeValue(value, type = null) {
    if (value == null) {
      return getDisplayValue(value);
    }

    if (type === VolumeConstants.type.external) {
      // External volumes specify size in GiB
      value = value * 1024;
    }

    return formatResource("disk", value);
  }

  /**
   * @override
   */
  getDefinition() {
    const { appConfig } = this.props;

    if (
      appConfig == null ||
      appConfig.container == null ||
      appConfig.container.volumes == null
    ) {
      // sanity check
      return null;
    }

    const volumes = appConfig.container.volumes;
    const config = {
      tabViewID: "volumes",
      values: [
        {
          heading: "Volumes",
          headingLevel: 1
        }
      ]
    };

    const volumesConfig = volumes.map((volume, index) => {
      if (volume.persistent != null && volume.persistent.profileName != null) {
        // DSS
        return [
          {
            heading: VolumeDefinitions.DSS.name,
            headingLevel: 2
          },
          {
            key: `container.volumes.${index}.persistent.profileName`,
            label: "PROFILE NAME"
          },
          {
            key: `container.volumes.${index}.containerPath`,
            label: "CONTAINER PATH"
          },
          {
            key: `container.volumes.${index}.persistent.size`,
            label: "SIZE",
            transformValue: this.getVolumeSizeValue
          }
        ];
      }

      if (volume.persistent != null) {
        // Local Persistent
        return [
          {
            heading: VolumeDefinitions.PERSISTENT.name,
            headingLevel: 2
          },
          {
            key: `container.volumes.${index}.containerPath`,
            label: "CONTAINER PATH"
          },
          {
            key: `container.volumes.${index}.persistent.size`,
            label: "SIZE",
            transformValue: this.getVolumeSizeValue
          }
        ];
      }

      if (volume.external != null) {
        // External
        const sizeConfig = [
          {
            key: `container.volumes.${index}.external.size`,
            label: "SIZE",
            transformValue: value => this.getVolumeSizeValue(value, "EXTERNAL")
          }
        ];
        const size = volume.external.size == null ? [] : sizeConfig;

        return [
          {
            heading: VolumeDefinitions.EXTERNAL.name,
            headingLevel: 2
          },
          {
            key: `container.volumes.${index}.external.name`,
            label: "NAME"
          },
          {
            key: `container.volumes.${index}.containerPath`,
            label: "CONTAINER PATH"
          }
        ].concat(size);
      }

      // Host
      return [
        {
          heading: VolumeDefinitions.HOST.name,
          headingLevel: 2
        },
        {
          key: `container.volumes.${index}.hostPath`,
          label: "HOST PATH"
        },
        {
          key: `container.volumes.${index}.containerPath`,
          label: "CONTAINER PATH"
        },
        {
          key: `container.volumes.${index}.mode`,
          label: "MODE"
        }
      ];
    });

    config.values = config.values.concat(...volumesConfig);

    return config;
  }
}

module.exports = ServiceStorageConfigSection;
