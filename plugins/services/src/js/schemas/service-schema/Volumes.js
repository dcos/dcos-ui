/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

const Volumes = {
  title: "Volumes",
  type: "object",
  properties: {
    localVolumes: {
      title: "Persistent Local Volumes",
      description: (
        <span>
          {
            "Specify a local volume or volumes to “pin” tasks and their associated data to the node they are first launched on. Tasks will be relaunched on that node if they terminate. "
          }
          <a
            href="https://dcos.io/docs/1.7/usage/storage/persistent-volume/"
            target="_blank"
          >
            Learn more about creating stateful tasks with persistent volumes
          </a>.
        </span>
      ),
      type: "array",
      duplicable: true,
      addLabel: "Add Local Volume",
      getter(service) {
        const containerSettings = service.getContainerSettings();

        if (containerSettings == null || containerSettings.volumes == null) {
          return [];
        }

        return containerSettings.volumes
          .filter(function(volume) {
            return volume.persistent != null;
          })
          .map(function(volume) {
            return {
              containerPath: volume.containerPath,
              size: volume.persistent.size
            };
          });
      },
      itemShape: {
        properties: {
          size: {
            title: "Size (MiB)",
            type: "number"
          },
          containerPath: {
            title: "Container Path",
            type: "string"
          }
        }
      }
    },
    dockerVolumes: {
      title: "Docker Container Volumes",
      description: (
        <span>
          {"Create a stateful application using Docker volumes. "}
          <a
            href="https://docs.docker.com/engine/tutorials/dockervolumes/"
            target="_blank"
          >
            Learn more about Docker volumes
          </a>.
        </span>
      ),
      type: "array",
      duplicable: true,
      addLabel: "Add Container Volume",
      getter(service) {
        const containerSettings = service.getContainerSettings();

        if (containerSettings == null || containerSettings.volumes == null) {
          return [];
        }

        return containerSettings.volumes
          .filter(function(volume) {
            return volume.hostPath != null;
          })
          .map(function({ containerPath, hostPath, mode }) {
            return {
              containerPath,
              hostPath,
              mode: mode.toLowerCase()
            };
          });
      },
      itemShape: {
        properties: {
          containerPath: {
            title: "Container Path",
            type: "string"
          },
          hostPath: {
            title: "Host Path",
            type: "string"
          },
          mode: {
            title: "Mode",
            fieldType: "select",
            default: "ro",
            options: [
              { html: "Read Only", id: "ro" },
              { html: "Read and Write", id: "rw" }
            ]
          }
        }
      }
    },
    externalVolumes: {
      title: "External Volumes",
      description: (
        <span>
          {
            "Create a stateful, fault-tolerant application with external volumes. "
          }
          <a
            href="https://docs.mesosphere.com/1.7/usage/storage/external-storage/"
            target="_blank"
          >
            Learn more about external volumes
          </a>.
        </span>
      ),
      type: "array",
      duplicable: true,
      addLabel: "Add External Volume",
      getter(service) {
        const containerSettings = service.getContainerSettings();

        if (containerSettings == null || containerSettings.volumes == null) {
          return [];
        }

        return containerSettings.volumes
          .filter(function(volume) {
            return volume.external != null;
          })
          .map(function({ containerPath, external }) {
            return {
              containerPath,
              externalName: external.name
            };
          });
      },
      itemShape: {
        properties: {
          externalName: {
            title: "Volume Name",
            type: "string"
          },
          containerPath: {
            title: "Container Path",
            type: "string"
          }
        }
      }
    }
  }
};

module.exports = Volumes;
