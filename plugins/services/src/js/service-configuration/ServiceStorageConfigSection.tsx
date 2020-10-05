import { Trans } from "@lingui/macro";
import * as React from "react";
import Units from "#SRC/js/utils/Units";
import Util from "#SRC/js/utils/Util";
import VolumeDefinitions from "#PLUGINS/services/src/js/constants/VolumeDefinitions";

import { getDisplayValue } from "../utils/ServiceConfigDisplayUtil";
import ServiceConfigBaseSectionDisplay from "./ServiceConfigBaseSectionDisplay";

const getVolumeSizeValue = (value, type: "GiB" | "MiB" = "MiB") =>
  value == null
    ? getDisplayValue(value)
    : Units.formatResource("disk", type === "GiB" ? value * 1024 : value);

class ServiceStorageConfigSection extends ServiceConfigBaseSectionDisplay {
  /**
   * @override
   */
  shouldExcludeItem() {
    const { appConfig } = this.props;

    const volumes = Util.findNestedPropertyInObject(
      appConfig,
      "container.volumes"
    );

    return !volumes.some((v) => v.persistent || v.external || v.hostPath);
  }

  /**
   * @override
   */
  getMountType() {
    return "CreateService:ServiceConfigDisplay:App:Storage";
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
          headingLevel: 1,
        },
      ],
    };

    const volumesConfig = volumes.map((volume, index) => {
      if (volume.persistent != null && volume.persistent.profileName != null) {
        // DSS
        return [
          {
            heading: <Trans id={VolumeDefinitions.DSS.name} render="span" />,
            headingLevel: 2,
          },
          {
            key: `container.volumes.${index}.persistent.profileName`,
            label: <Trans render="span">Profile Name</Trans>,
          },
          {
            key: `container.volumes.${index}.containerPath`,
            label: <Trans render="span">Container Path</Trans>,
          },
          {
            key: `container.volumes.${index}.persistent.size`,
            label: <Trans render="span">Size</Trans>,
            transformValue: getVolumeSizeValue,
          },
        ];
      }

      if (volume.persistent != null) {
        // Local Persistent
        return [
          {
            heading: (
              <Trans id={VolumeDefinitions.PERSISTENT.name} render="span" />
            ),
            headingLevel: 2,
          },
          {
            key: `container.volumes.${index}.containerPath`,
            label: <Trans render="span">Container Path</Trans>,
          },
          {
            key: `container.volumes.${index}.persistent.size`,
            label: <Trans render="span">Size</Trans>,
            transformValue: getVolumeSizeValue,
          },
        ];
      }

      if (volume.external != null) {
        // External
        const sizeConfig = [
          {
            key: `container.volumes.${index}.external.size`,
            label: <Trans render="span">Size</Trans>,
            transformValue: (value) => getVolumeSizeValue(value, "GiB"),
          },
        ];
        const size = volume.external.size == null ? [] : sizeConfig;

        return [
          {
            heading: (
              <Trans id={VolumeDefinitions.EXTERNAL.name} render="span" />
            ),
            headingLevel: 2,
          },
          {
            key: `container.volumes.${index}.external.name`,
            label: <Trans render="span">Name</Trans>,
          },
          {
            key: `container.volumes.${index}.containerPath`,
            label: <Trans render="span">Container Path</Trans>,
          },
        ].concat(size);
      }

      // Host
      if (volume.hostPath) {
        return [
          {
            heading: <Trans id={VolumeDefinitions.HOST.name} render="span" />,
            headingLevel: 2,
          },
          {
            key: `container.volumes.${index}.hostPath`,
            label: <Trans render="span">Host Path</Trans>,
          },
          {
            key: `container.volumes.${index}.containerPath`,
            label: <Trans render="span">Container Path</Trans>,
          },
          {
            key: `container.volumes.${index}.mode`,
            label: <Trans render="span">Mode</Trans>,
          },
        ];
      }

      return null;
    });

    config.values = config.values.concat(...volumesConfig.filter((v) => v));

    return config;
  }
}

export default ServiceStorageConfigSection;
