import { Trans } from "@lingui/macro";
import { Tooltip, Select, SelectOption } from "reactjs-components";
import PropTypes from "prop-types";
import React, { Component } from "react";
import Objektiv from "objektiv";
import { MountService } from "foundation-ui";

import AddButton from "#SRC/js/components/form/AddButton";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FieldSelect from "#SRC/js/components/form/FieldSelect";
import { findNestedPropertyInObject, omit } from "#SRC/js/utils/Util";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupContainer from "#SRC/js/components/form/FormGroupContainer";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";
import Icon from "#SRC/js/components/Icon";
import MetadataStore from "#SRC/js/stores/MetadataStore";

import VolumeDefinitions from "#PLUGINS/services/src/js/constants/VolumeDefinitions";

import ContainerConstants from "../../constants/ContainerConstants";

import { FormReducer as volumes } from "../../reducers/serviceForm/FormReducers/Volumes";

const {
  type: { DOCKER }
} = ContainerConstants;

const errorsLens = Objektiv.attr("container", {}).attr("volumes", []);
const excludedTypes = ["EPHEMERAL", "DSS"];

class VolumesFormSection extends Component {
  getPersistentVolumeConfig(volume, key) {
    if (volume.type !== "PERSISTENT") {
      return null;
    }

    const sizeError = errorsLens
      .at(key, {})
      .attr("persistent", {})
      .get(this.props.errors).size;
    const containerPathError = errorsLens.at(key, {}).get(this.props.errors)
      .containerPath;
    const tooltipContent = (
      <Trans render="span">
        The path where your application will read and write data. This must be a{" "}
        single-level path relative to the container.{" "}
        <a
          href={MetadataStore.buildDocsURI("/storage/persistent-volume/")}
          target="_blank"
        >
          More information
        </a>.
      </Trans>
    );

    return (
      <FormRow>
        <FormGroup className="column-4" showError={Boolean(containerPathError)}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans render="span">Container Path</Trans>
              </FormGroupHeadingContent>
              <FormGroupHeadingContent>
                <Tooltip
                  content={tooltipContent}
                  interactive={true}
                  maxWidth={300}
                  wrapText={true}
                >
                  <Icon color="light-grey" id="circle-question" size="mini" />
                </Tooltip>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldInput
            name={`volumes.${key}.containerPath`}
            type="text"
            value={volume.containerPath}
          />
          <FieldError>{containerPathError}</FieldError>
        </FormGroup>
        <FormGroup className="column-2" showError={Boolean(sizeError)}>
          <FieldLabel className="text-no-transform">
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans render="span">SIZE (MiB)</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldAutofocus>
            <FieldInput
              name={`volumes.${key}.size`}
              type="number"
              value={volume.size}
            />
          </FieldAutofocus>
          <FieldError>{sizeError}</FieldError>
        </FormGroup>
      </FormRow>
    );
  }

  getHostVolumeConfig(volume, key) {
    if (volume.type !== "HOST") {
      return null;
    }

    const errors = errorsLens.at(key, {}).get(this.props.errors);
    const hostPathError = errors.hostPath;
    const containerPathError = errors.containerPath;
    const modeError = errors.mode;
    const tooltipContent = (
      <Trans render="span">
        If you are using the Mesos containerizer, this must be a single-level{" "}
        path relative to the container.{" "}
        <a
          href={MetadataStore.buildDocsURI("/storage/external-storage/")}
          target="_blank"
        >
          More information
        </a>.
      </Trans>
    );

    return (
      <FormRow>
        <FormGroup className="column-4" showError={Boolean(hostPathError)}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans render="span">Host Path</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldAutofocus>
            <FieldInput
              name={`volumes.${key}.hostPath`}
              value={volume.hostPath}
            />
          </FieldAutofocus>
          <FieldError>{hostPathError}</FieldError>
        </FormGroup>
        <FormGroup className="column-4" showError={Boolean(containerPathError)}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans render="span">Container Path</Trans>
              </FormGroupHeadingContent>
              <FormGroupHeadingContent>
                <Tooltip
                  content={tooltipContent}
                  interactive={true}
                  maxWidth={300}
                  wrapText={true}
                >
                  <Icon color="light-grey" id="circle-question" size="mini" />
                </Tooltip>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldInput
            name={`volumes.${key}.containerPath`}
            type="text"
            value={volume.containerPath}
          />
          <FieldError>{containerPathError}</FieldError>
        </FormGroup>
        <FormGroup className="column-4" showError={Boolean(modeError)}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans render="span">Mode</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldSelect name={`volumes.${key}.mode`} value={volume.mode}>
            <option value="RW">
              <Trans render="span">Read and Write</Trans>
            </option>
            <option value="RO">
              <Trans render="span">Read Only</Trans>
            </option>
          </FieldSelect>
        </FormGroup>
      </FormRow>
    );
  }

  getExternalVolumeConfig(volume, key) {
    if (volume.type !== "EXTERNAL") {
      return null;
    }

    const nameError = errorsLens
      .at(key, {})
      .attr("external", {})
      .get(this.props.errors).name;

    const sizeError = errorsLens
      .at(key, {})
      .attr("external", {})
      .get(this.props.errors).size;

    const containerPathError = errorsLens.at(key, {}).get(this.props.errors)
      .containerPath;

    const runtimeType = findNestedPropertyInObject(
      this.props.data,
      "container.type"
    );
    const tooltipContent = (
      <Trans render="span">
        Docker Runtime only supports the default size for implicit volumes,{" "}
        please select Universal Container Runtime (UCR) if you want to modify{" "}
        the size.
      </Trans>
    );

    let sizeField = (
      <Tooltip
        content={tooltipContent}
        width={300}
        wrapperClassName="tooltip-wrapper tooltip-block-wrapper text-align-center"
        wrapText={true}
      >
        <FieldInput
          name={`volumes.${key}.size`}
          type="number"
          disabled={true}
          value={""}
        />
      </Tooltip>
    );

    if (runtimeType !== DOCKER) {
      sizeField = (
        <FieldInput
          name={`volumes.${key}.size`}
          type="number"
          value={volume.size}
        />
      );
    }

    return (
      <FormRow>
        <FormGroup className="column-4" showError={Boolean(nameError)}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans render="span">Name</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldAutofocus>
            <FieldInput
              name={`volumes.${key}.name`}
              type="text"
              value={volume.name}
            />
          </FieldAutofocus>
          <FieldError>{nameError}</FieldError>
        </FormGroup>
        <FormGroup className="column-4" showError={Boolean(containerPathError)}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans render="span">Container Path</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldInput
            name={`volumes.${key}.containerPath`}
            type="text"
            value={volume.containerPath}
          />
          <FieldError>{containerPathError}</FieldError>
        </FormGroup>
        <FormGroup className="column-2" showError={Boolean(sizeError)}>
          <FieldLabel className="text-no-transform">
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans render="span">SIZE (GiB)</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          {sizeField}
          <FieldError>{sizeError}</FieldError>
        </FormGroup>
      </FormRow>
    );
  }

  getUnknownVolumeConfig(volume, key) {
    return (
      <MountService.Mount
        type="CreateService:SingleContainerVolumes:UnknownVolumes"
        volume={volume}
        index={key}
        errors={this.props.errors}
      >
        <FieldLabel>
          <Trans render="span">Unable to edit this Volume</Trans>
        </FieldLabel>
        <pre>
          {JSON.stringify(omit(volume, ["external", "size", "type"]), null, 2)}
        </pre>
      </MountService.Mount>
    );
  }

  getVolumesLines(data) {
    return data.map((volume, key) => {
      const typeError = errorsLens.at(key, {}).get(this.props.errors).type;

      if (
        volume.type != null &&
        !["EXTERNAL", "HOST", "PERSISTENT", ""].includes(volume.type)
      ) {
        return (
          <FormGroupContainer
            key={key}
            onRemove={this.props.onRemoveItem.bind(this, {
              value: key,
              path: "volumes"
            })}
          >
            {this.getUnknownVolumeConfig(volume, key)}
          </FormGroupContainer>
        );
      }

      return (
        <FormGroupContainer
          key={key}
          onRemove={this.props.onRemoveItem.bind(this, {
            value: key,
            path: "volumes"
          })}
        >
          <FormRow>
            <FormGroup className="column-5" showError={Boolean(typeError)}>
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent primary={true}>
                    <Trans render="span">Volume Type</Trans>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <MountService.Mount
                type="CreateService:SingleContainerVolumes:Types"
                volume={volume}
                index={key}
              >
                <Select
                  name={`volumes.${key}.type`}
                  value={volume.type}
                  placeholder="Select ..."
                >
                  {Object.keys(VolumeDefinitions)
                    .filter(type => !excludedTypes.includes(type))
                    .map((type, index) => {
                      return (
                        <SelectOption
                          key={index}
                          value={type}
                          label={VolumeDefinitions[type].name}
                        >
                          <div className="dropdown-select-item-title">
                            <span>{VolumeDefinitions[type].name}</span>
                            {VolumeDefinitions[type].recommended ? (
                              <Trans
                                render="span"
                                className="dropdown-select-item-title__badge badge"
                              >
                                Recommended
                              </Trans>
                            ) : null}
                          </div>
                          <span className="dropdown-select-item-description">
                            {VolumeDefinitions[type].description}
                          </span>
                        </SelectOption>
                      );
                    })}
                </Select>
              </MountService.Mount>
            </FormGroup>
          </FormRow>
          {this.getPersistentVolumeConfig(volume, key)}
          {this.getHostVolumeConfig(volume, key)}
          {this.getExternalVolumeConfig(volume, key)}
        </FormGroupContainer>
      );
    });
  }

  render() {
    const { data } = this.props;

    const tooltipContent = (
      <Trans>
        DC/OS offers several storage options.{" "}
        <a href={MetadataStore.buildDocsURI("/storage/")} target="_blank">
          More information
        </a>.
      </Trans>
    );

    return (
      <div>
        <h1 className="flush-top short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              <Trans render="span">Volumes</Trans>
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={tooltipContent}
                interactive={true}
                maxWidth={300}
                wrapText={true}
              >
                <Icon color="light-grey" id="circle-question" size="mini" />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h1>
        <Trans render="p">
          Create a stateful service by configuring a persistent volume.
          Persistent volumes enable instances to be restarted without data loss.
        </Trans>
        {this.getVolumesLines(data.volumes)}
        <div>
          <AddButton
            onClick={this.props.onAddItem.bind(this, {
              path: "volumes"
            })}
          >
            <Trans render="span">Add Volume</Trans>
          </AddButton>
        </div>
      </div>
    );
  }
}

VolumesFormSection.defaultProps = {
  data: {},
  errors: {},
  onAddItem() {},
  onRemoveItem() {}
};

VolumesFormSection.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.object,
  onAddItem: PropTypes.func,
  onRemoveItem: PropTypes.func
};

VolumesFormSection.configReducers = {
  volumes
};

VolumesFormSection.validationReducers = {
  volumes() {
    return [];
  }
};

module.exports = VolumesFormSection;
