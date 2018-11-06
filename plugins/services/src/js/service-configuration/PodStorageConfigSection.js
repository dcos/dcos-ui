import PropTypes from "prop-types";
import React from "react";
import { MountService } from "foundation-ui";
import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";

import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";

import ConfigurationMapTable from "../components/ConfigurationMapTable";
import ServiceConfigDisplayUtil from "../utils/ServiceConfigDisplayUtil";
import VolumeConstants from "../constants/VolumeConstants";

const BOOLEAN_OPTIONS = {
  truthy: i18nMark("TRUE"),
  falsy: i18nMark("FALSE")
};

class PodStorageConfigSection extends React.Component {
  getColumns() {
    return [
      {
        heading() {
          return <Trans render="span">Volume</Trans>;
        },
        prop: "volume"
      },
      {
        heading() {
          return <Trans render="span">Type</Trans>;
        },
        prop: "type"
      },
      {
        heading() {
          return <Trans render="span">Size (MiB)</Trans>;
        },
        prop: "size"
      },
      {
        heading() {
          return <Trans render="span">Read Only</Trans>;
        },
        prop: "readOnly",
        render(prop, row) {
          if (row[prop]) {
            return <Trans id={BOOLEAN_OPTIONS.truthy} />;
          }

          return <Trans id={BOOLEAN_OPTIONS.falsy} />;
        }
      },
      {
        heading() {
          return <Trans render="span">Container Mount Path</Trans>;
        },
        prop: "mountPath"
      },
      {
        heading() {
          return <Trans render="span">Host Path</Trans>;
        },
        prop: "hostPath"
      },
      {
        heading() {
          return <Trans render="span">Container</Trans>;
        },
        prop: "container"
      }
    ];
  }

  render() {
    const { onEditClick } = this.props;
    const { volumes = [], containers = [] } = this.props.appConfig;
    const volumeSummary = volumes.reduce((memo, volume) => {
      let type = VolumeConstants.type.unknown;
      if (volume.host != null) {
        type = VolumeConstants.type.host;
      }
      if (volume.persistent != null) {
        if (volume.persistent.profileName != null) {
          type = VolumeConstants.type.dss;
        } else {
          type = VolumeConstants.type.localPersistent;
        }
      }
      if (Object.keys(volume).length === 1 && volume.name != null) {
        type = VolumeConstants.type.ephemeral;
      }

      let size;
      if (volume.persistent != null && volume.persistent.size != null) {
        size = volume.persistent.size;
      }

      const volumeInfo = {
        type,
        volume: volume.name,
        hostPath: volume.host,
        size
      };

      // Fetch all mounts for this volume in the containers
      const containerMounts = containers.reduce((cmMemo, container) => {
        const { volumeMounts = [] } = container;

        return cmMemo.concat(
          volumeMounts
            .filter(volumeMount => volumeMount.name === volume.name)
            .map(volumeMount => {
              return {
                container: ServiceConfigDisplayUtil.getContainerNameWithIcon(
                  container
                ),
                mountPath: volumeMount.mountPath,
                readOnly: volumeMount.readOnly || false
              };
            })
        );
      }, []);

      // If there are no mounts, add only one line without containers
      if (containerMounts.length === 0) {
        memo.push(volumeInfo);

        return memo;
      }

      // Otherwise create one volume entry for each mount
      return containerMounts.reduce((volumesMemo, mountInfo) => {
        return volumesMemo.concat(Object.assign({}, volumeInfo, mountInfo));
      }, memo);
    }, []);

    if (!volumeSummary.length) {
      return null;
    }

    return (
      <div>
        <Trans render={<ConfigurationMapHeading level={1} />}>Volumes</Trans>
        <ConfigurationMapSection key="pod-general-section">
          <MountService.Mount
            type="CreateService:ServiceConfigDisplay:Pod:Storage"
            appConfig={this.props.appConfig}
            onEditClick={onEditClick}
          >
            <ConfigurationMapTable
              columnDefaults={{ hideIfEmpty: true }}
              columns={this.getColumns()}
              data={volumeSummary}
              onEditClick={onEditClick}
              tabViewID="volumes"
            />
          </MountService.Mount>
        </ConfigurationMapSection>
      </div>
    );
  }
}

PodStorageConfigSection.defaultProps = {
  appConfig: {}
};

PodStorageConfigSection.propTypes = {
  appConfig: PropTypes.object,
  onEditClick: PropTypes.func
};

module.exports = PodStorageConfigSection;
