import React from "react";

import ConfigurationMapHeading
  from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapSection
  from "#SRC/js/components/ConfigurationMapSection";

import ConfigurationMapTable from "../components/ConfigurationMapTable";
import ServiceConfigDisplayUtil from "../utils/ServiceConfigDisplayUtil";
import VolumeConstants from "../constants/VolumeConstants";

const BOOLEAN_OPTIONS = {
  truthy: "TRUE",
  falsy: "FALSE"
};

class PodStorageConfigSection extends React.Component {
  getColumns() {
    return [
      {
        heading: "Volume",
        prop: "volume"
      },
      {
        heading: "Type",
        prop: "type"
      },
      {
        heading: "Size",
        prop: "size"
      },
      {
        heading: "Read Only",
        prop: "readOnly",
        render(prop, row) {
          if (row[prop]) {
            return BOOLEAN_OPTIONS.truthy;
          }

          return BOOLEAN_OPTIONS.falsy;
        }
      },
      {
        heading: "Container Mount Path",
        prop: "mountPath"
      },
      {
        heading: "Host Path",
        prop: "hostPath"
      },
      {
        heading: "Container",
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
      if (Object.keys(volume).length === 1 && volume.name != null) {
        type = VolumeConstants.type.ephemeral;
      }

      const volumeInfo = {
        type,
        volume: volume.name,
        hostPath: volume.host
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
        <ConfigurationMapHeading level={1}>Storage</ConfigurationMapHeading>
        <ConfigurationMapSection key="pod-general-section">
          <ConfigurationMapTable
            columnDefaults={{ hideIfEmpty: true }}
            columns={this.getColumns()}
            data={volumeSummary}
            onEditClick={onEditClick}
            tabViewID="multivolumes"
          />
        </ConfigurationMapSection>
      </div>
    );
  }
}

PodStorageConfigSection.defaultProps = {
  appConfig: {}
};

PodStorageConfigSection.propTypes = {
  appConfig: React.PropTypes.object,
  onEditClick: React.PropTypes.func
};

module.exports = PodStorageConfigSection;
