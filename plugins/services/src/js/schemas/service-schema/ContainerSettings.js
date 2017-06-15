/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import ContainerValidatorUtil from "../../utils/ContainerValidatorUtil";

const ContainerSettings = {
  title: "Container Settings",
  description: "Configure your Docker Container. You can configure your Docker volumes in the Volumes tab and your Docker ports in the Network tab.",
  type: "object",
  properties: {
    basic: {
      type: "group",
      properties: {
        image: {
          description: (
            <span>
              {"Configure your Docker container. Use "}
              <a href="https://hub.docker.com/explore/" target="_blank">
                DockerHub
              </a> to find popular repositories.
            </span>
          ),
          title: "Container Image",
          type: "string",
          getter(service) {
            const container = service.getContainerSettings();
            if (container && container.docker && container.docker.image) {
              return container.docker.image;
            }

            return null;
          },
          externalValidator({ containerSettings }, definition) {
            const { image } = containerSettings;

            if (
              image == null ||
              ContainerValidatorUtil.isValidDockerImage(image)
            ) {
              return true;
            }

            definition.showError =
              "Container Image  must not contain " +
              "whitespace and should not contain any other characters " +
              "than lowercase letters, digits, hyphens, underscores, " +
              "and colons.";

            return false;
          }
        }
      }
    },
    flags: {
      type: "group",
      properties: {
        privileged: {
          label: "Extend runtime privileges",
          showLabel: false,
          type: "boolean",
          getter(service) {
            const container = service.getContainerSettings();
            if (container && container.docker && container.docker.privileged) {
              return container.docker.privileged;
            }

            return null;
          }
        },
        forcePullImage: {
          label: "Force pull image on launch",
          showLabel: false,
          type: "boolean",
          getter(service) {
            const container = service.getContainerSettings();
            if (
              container &&
              container.docker &&
              container.docker.forcePullImage
            ) {
              return container.docker.forcePullImage;
            }

            return null;
          }
        }
      }
    },
    parameters: {
      title: "Docker Parameters",
      description: (
        <span>
          {"Supply options for the "}
          <a
            href="https://docs.docker.com/engine/reference/commandline/run/"
            target="_blank"
          >
            docker run
          </a> command executed by the Mesos containerizer.
        </span>
      ),
      type: "array",
      duplicable: true,
      addLabel: "Add Parameter",
      getter(service) {
        const container = service.getContainerSettings();
        if (container && container.docker && container.docker.parameters) {
          return container.docker.parameters;
        }

        return null;
      },
      itemShape: {
        properties: {
          key: {
            title: "Key",
            type: "string"
          },
          value: {
            title: "Value",
            type: "string"
          }
        }
      }
    }
  },
  required: []
};

module.exports = ContainerSettings;
