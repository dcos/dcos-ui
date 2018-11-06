import { Trans } from "@lingui/macro";
import React from "react";
import { formatResource } from "#SRC/js/utils/Units";
import Util from "#SRC/js/utils/Util";
import VolumeDefinitions from "#PLUGINS/services/src/js/constants/VolumeDefinitions";
import VolumeConstants from "#PLUGINS/services/src/js/constants/VolumeConstants";

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
      return super.getDefinition();
    }

    const volumes = appConfig.container.volumes;
    const config = {
      tabViewID: "volumes",
      values: [
        {
          key: "container.volumes",
          heading: <Trans render="span">Volumes</Trans>,
          headingLevel: 1
        }
      ]
    };

    const volumesConfig = volumes.map((volume, index) => {
      if (volume.persistent != null && volume.persistent.profileName != null) {
        // DSS
        return [
          {
            heading: <Trans id={VolumeDefinitions.DSS.name} render="span" />,
            headingLevel: 2
          },
          {
            key: `container.volumes.${index}.persistent.profileName`,
            label: <Trans render="span">Profile Name</Trans>
          },
          {
            key: `container.volumes.${index}.containerPath`,
            label: <Trans render="span">Container Path</Trans>
          },
          {
            key: `container.volumes.${index}.persistent.size`,
            label: <Trans render="span">Size</Trans>,
            transformValue: this.getVolumeSizeValue
          }
        ];
      }

      if (volume.persistent != null) {
        // Local Persistent
        return [
          {
            heading: (
              <Trans id={VolumeDefinitions.PERSISTENT.name} render="span" />
            ),
            headingLevel: 2
          },
          {
            key: `container.volumes.${index}.containerPath`,
            label: <Trans render="span">Container Path</Trans>
          },
          {
            key: `container.volumes.${index}.persistent.size`,
            label: <Trans render="span">Size</Trans>,
            transformValue: this.getVolumeSizeValue
          }
        ];
      }

      if (volume.external != null) {
        // External
        const sizeConfig = [
          {
            key: `container.volumes.${index}.external.size`,
            label: <Trans render="span">Size</Trans>,
            transformValue: value => this.getVolumeSizeValue(value, "EXTERNAL")
          }
        ];
        const size = volume.external.size == null ? [] : sizeConfig;

        return [
          {
            heading: (
              <Trans id={VolumeDefinitions.EXTERNAL.name} render="span" />
            ),
            headingLevel: 2
          },
          {
            key: `container.volumes.${index}.external.name`,
            label: <Trans render="span">Name</Trans>
          },
          {
            key: `container.volumes.${index}.containerPath`,
            label: <Trans render="span">Container Path</Trans>
          }
        ].concat(size);
      }

      // Host
      return [
        {
          heading: <Trans id={VolumeDefinitions.HOST.name} render="span" />,
          headingLevel: 2
        },
        {
          key: `container.volumes.${index}.hostPath`,
          label: <Trans render="span">Host Path</Trans>
        },
        {
          key: `container.volumes.${index}.containerPath`,
          label: <Trans render="span">Container Path</Trans>
        },
        {
          key: `container.volumes.${index}.mode`,
          label: <Trans render="span">Mode</Trans>
        }
      ];
    });

    config.values = config.values.concat(...volumesConfig);

    return config;
  }
}

module.exports = ServiceStorageConfigSection;
