import PropTypes from "prop-types";
import React, { Component } from "react";
import { Tooltip } from "reactjs-components";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FieldTextarea from "#SRC/js/components/form/FieldTextarea";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent
  from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";
import Icon from "#SRC/js/components/Icon";
import MetadataStore from "#SRC/js/stores/MetadataStore";

import {
  FormReducer as ContainerReducer
} from "../../reducers/serviceForm/Container";
import {
  FormReducer as ContainersReducer
} from "../../reducers/serviceForm/FormReducers/Containers";
import PodSpec from "../../structs/PodSpec";

const appPaths = {
  cmd: "cmd",
  containerName: "",
  cpus: "cpus",
  image: "{basePath}.docker.image",
  mem: "mem",
  type: "{basePath}.type"
};

const podPaths = {
  cmd: "{basePath}.exec.command.shell",
  containerName: "{basePath}.name",
  cpus: "{basePath}.resources.cpus",
  image: "{basePath}.image.id",
  mem: "{basePath}.resources.mem",
  type: "{basePath}.type"
};

class ContainerServiceFormSection extends Component {
  getFieldPath(basePath, fieldName) {
    if (this.props.service instanceof PodSpec) {
      return podPaths[fieldName].replace("{basePath}", basePath);
    }

    return appPaths[fieldName].replace("{basePath}", basePath);
  }

  getCMDLabel() {
    const tooltipContent = (
      <span>
        {
          "The command value will be wrapped by the underlying Mesos executor via /bin/sh -c ${cmd}. "
        }
        <a
          href={MetadataStore.buildDocsURI(
            "/deploying-services/creating-services/"
          )}
          target="_blank"
        >
          More information
        </a>.
      </span>
    );

    return (
      <FieldLabel>
        <FormGroupHeading>
          <FormGroupHeadingContent primary={true}>
            Command
          </FormGroupHeadingContent>
          <FormGroupHeadingContent>
            <Tooltip
              content={tooltipContent}
              interactive={true}
              wrapText={true}
              maxWidth={300}
            >
              <Icon color="light-grey" id="circle-question" size="mini" />
            </Tooltip>
          </FormGroupHeadingContent>
        </FormGroupHeading>
      </FieldLabel>
    );
  }

  getImageLabel() {
    const tooltipContent = (
      <span>
        {"Enter a Docker image or browse "}
        <a href="https://hub.docker.com/explore/" target="_blank">
          Docker Hub
        </a>
        {
          " to find more. You can also enter an image from your private registry. "
        }
        <a
          href="https://github.com/dcos/examples/tree/master/registry/1.8"
          target="_blank"
        >
          More information
        </a>.
      </span>
    );

    return (
      <FieldLabel>
        <FormGroupHeading>
          <FormGroupHeadingContent primary={true}>
            Container Image
          </FormGroupHeadingContent>
          <FormGroupHeadingContent>
            <Tooltip
              content={tooltipContent}
              interactive={true}
              wrapText={true}
              maxWidth={300}
            >
              <Icon color="light-grey" id="circle-question" size="mini" />
            </Tooltip>
          </FormGroupHeadingContent>
        </FormGroupHeading>
      </FieldLabel>
    );
  }

  getContainerNameField() {
    const { data, errors, path, service } = this.props;
    if (!(service instanceof PodSpec)) {
      return null;
    }

    const containerNamePath = this.getFieldPath(path, "containerName");
    const containerName = findNestedPropertyInObject(data, containerNamePath);
    const containerNameErrors = findNestedPropertyInObject(
      errors,
      containerNamePath
    );

    return (
      <FormRow>
        <FormGroup
          className="column-6"
          showError={Boolean(containerNameErrors)}
        >
          <FieldLabel>Container Name</FieldLabel>
          <FieldInput name={containerNamePath} value={containerName} />
          <FieldError>{containerNameErrors}</FieldError>
        </FormGroup>
      </FormRow>
    );
  }

  render() {
    const { data, errors, path } = this.props;
    const imagePath = this.getFieldPath(path, "image");
    const image = findNestedPropertyInObject(data, imagePath);
    const imageErrors = findNestedPropertyInObject(errors, imagePath);
    const cpusPath = this.getFieldPath(path, "cpus");
    const cpusErrors = findNestedPropertyInObject(errors, cpusPath);
    const memPath = this.getFieldPath(path, "mem");
    const memErrors = findNestedPropertyInObject(errors, memPath);
    const cmdPath = this.getFieldPath(path, "cmd");
    const cmdErrors = findNestedPropertyInObject(errors, cmdPath);

    return (
      <div className="pod pod-short flush-horizontal flush-bottom">
        {this.getContainerNameField()}
        <FormRow>
          <FormGroup className="column-6" showError={Boolean(imageErrors)}>
            {this.getImageLabel()}
            <FieldInput name={imagePath} value={image} />
            <FieldHelp>
              Enter a Docker image you want to run, e.g. nginx.
            </FieldHelp>
            <FieldError>{imageErrors}</FieldError>
          </FormGroup>

          <FormGroup className="column-3" showError={Boolean(cpusErrors)}>
            <FieldLabel className="text-no-transform">
              <FormGroupHeading required={true}>
                <FormGroupHeadingContent>
                  CPUs
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
            <FieldInput
              min="0.001"
              name={cpusPath}
              step="any"
              type="number"
              value={findNestedPropertyInObject(data, cpusPath)}
            />
            <FieldError>{cpusErrors}</FieldError>
          </FormGroup>

          <FormGroup className="column-3" showError={Boolean(memErrors)}>
            <FieldLabel className="text-no-transform">
              <FormGroupHeading required={true}>
                <FormGroupHeadingContent primary={true}>
                  Memory (MiB)
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
            <FieldInput
              min="0.001"
              name={memPath}
              step="any"
              type="number"
              value={findNestedPropertyInObject(data, memPath)}
            />
            <FieldError>{memErrors}</FieldError>
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup className="column-12" showError={Boolean(cmdErrors)}>
            {this.getCMDLabel()}
            <FieldTextarea
              name={cmdPath}
              value={findNestedPropertyInObject(data, cmdPath)}
            />
            <FieldHelp>
              A shell command for your container to execute.
            </FieldHelp>
            <FieldError>{cmdErrors}</FieldError>
          </FormGroup>
        </FormRow>
      </div>
    );
  }
}

ContainerServiceFormSection.defaultProps = {
  data: {},
  errors: {},
  onAddItem() {},
  onRemoveItem() {},
  path: "container"
};

ContainerServiceFormSection.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.object,
  onAddItem: PropTypes.func,
  onRemoveItem: PropTypes.func,
  path: PropTypes.string
};

ContainerServiceFormSection.configReducers = {
  container: ContainerReducer,
  containers: ContainersReducer
};

module.exports = ContainerServiceFormSection;
