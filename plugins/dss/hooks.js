/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import Objektiv from "objektiv";
import { Select, SelectOption } from "reactjs-components";

import { MountService } from "foundation-ui";

import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FieldSelect from "#SRC/js/components/form/FieldSelect";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent
  from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";
import VolumeConstants
  from "#PLUGINS/services/src/js/constants/VolumeConstants";
import {
  getContainerNameWithIcon
} from "#PLUGINS/services/src/js/utils/ServiceConfigDisplayUtil";
import { omit } from "#SRC/js/utils/Util";

import VolumeDefinitions
  from "#PLUGINS/services/src/js/constants/VolumeDefinitions";

const errorsLens = Objektiv.attr("container", {}).attr("volumes", []);
const excludedTypes = ["EPHEMERAL"];

function getContainerMounts(containers, volumeMountIndex, volumeMounts) {
  return containers.map((container, containerIndex) => {
    let containersLabel = null;
    let pathLabel = null;
    if (containerIndex === 0) {
      containersLabel = (
        <FieldLabel>
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              Containers
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </FieldLabel>
      );
      pathLabel = (
        <FieldLabel>
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              Container Path
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </FieldLabel>
      );
    }

    return (
      <FormRow key={containerIndex}>
        <FormGroup className="column-3">
          {containersLabel}
          <div className="form-control-input-height">
            {getContainerNameWithIcon(container)}
          </div>
        </FormGroup>
        <FormGroup className="column-9">
          {pathLabel}
          <FieldInput
            name={`volumeMounts.${volumeMountIndex}.mountPath.${containerIndex}`}
            type="text"
            value={volumeMounts[volumeMountIndex].mountPath[containerIndex]}
          />
        </FormGroup>
      </FormRow>
    );
  });
}

function VolumeMountTypesSelect(props) {
  return (
    <FieldSelect
      name={`volumeMounts.${props.index}.type`}
      value={props.volumes.type}
    >
      <option value="">Select...</option>
      <option value={VolumeConstants.type.host}>Host Volume</option>
      <option value={VolumeConstants.type.ephemeral}>
        Ephemeral Volume
      </option>
      <option value={VolumeConstants.type.localPersistent}>
        Local Persistent Volume
      </option>
      <option value={VolumeConstants.type.dss}>
        DC/OS Storage Service
      </option>
    </FieldSelect>
  );
}

function DSSInput(props) {
  const { volumes, index, offset } = props;
  if (volumes.type !== VolumeConstants.type.dss) {
    return (
      <div>
        <FieldLabel>
          Unable to edit this Volume
        </FieldLabel>
        <pre>
          {JSON.stringify(omit(volumes, ["type", "mountPath"]), null, 2)}
        </pre>
      </div>
    );
  }

  const nameError = errorsLens
    .at(index + offset, {})
    .attr("volumes", {})
    .get(props.errors).name;

  return (
    <div>
      <FormRow>
        <FormGroup className="column-6" showError={false}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Volume Type
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <MountService.Mount
            type="CreateService:MultiContainerVolumes:Types"
            volumes={volumes}
            index={index}
          >
            <FieldSelect
              name={`volumeMounts.${index}.type`}
              value={volumes.type}
            >
              <option value="">Select...</option>
              <option value={VolumeConstants.type.host}>Host Volume</option>
              <option value={VolumeConstants.type.ephemeral}>
                Ephemeral Volume
              </option>
              <option value={VolumeConstants.type.localPersistent}>
                Local Persistent Volume
              </option>
              <option value={VolumeConstants.type.dss}>
                DC/OS Storage Service
              </option>
            </FieldSelect>
          </MountService.Mount>
        </FormGroup>
        <FormGroup className="column-6" showError={Boolean(nameError)}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Name
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldInput
            name={`volumeMounts.${index}.name`}
            type="text"
            value={volumes.name}
          />
          <FieldError>{nameError}</FieldError>
        </FormGroup>
      </FormRow>
      <FormRow>
        <FormGroup className="column-4">
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Profile Name
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldAutofocus>
            <FieldInput
              name={`volumeMounts.${index}.profileName`}
              type="text"
              value={volumes.profileName}
            />
          </FieldAutofocus>
        </FormGroup>
        <FormGroup className="column-3">
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Size (MiB)
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldAutofocus>
            <FieldInput
              name={`volumeMounts.${index}.size`}
              type="number"
              value={volumes.size}
            />
          </FieldAutofocus>
        </FormGroup>
      </FormRow>
      {getContainerMounts(
        props.data.containers,
        index,
        props.data.volumeMounts
      )}
    </div>
  );
}

function VolumeTypeSelect(props) {
  return (
    <Select
      name={`volumes.${props.index}.type`}
      value={props.volume.type}
      placeholder="Select ..."
    >
      {Object.keys(VolumeDefinitions)
        .filter(type => !excludedTypes.includes(type))
        .map((type, index) => {
          if (type === "EPHEMERAL") {
            return <noscript />;
          }

          return (
            <SelectOption
              key={index}
              value={type}
              label={VolumeDefinitions[type].type}
            >
              <span className="dropdown-select-item-title">
                {VolumeDefinitions[type].name}
              </span>
              <span className="dropdown-select-item-description">
                {VolumeDefinitions[type].description}
              </span>
            </SelectOption>
          );
        })}
    </Select>
  );
}

function DSSVolumeConfig(props) {
  const { volume, index } = props;
  if (volume.type !== "DSS") {
    return null;
  }

  const sizeError = errorsLens
    .at(index, {})
    .attr("persistent", {})
    .get(props.errors).size;
  const profileNameError = errorsLens
    .at(index, {})
    .attr("persistent", {})
    .get(props.errors).profileName;
  const containerPathError = errorsLens.at(index, {}).get(props.errors)
    .containerPath;
  const typeError = errorsLens.at(index, {}).get(props.errors).type;

  return (
    <div>
      <FormRow>
        <FormGroup className="column-5" showError={Boolean(typeError)}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Volume Type
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <MountService.Mount
            type="CreateService:SingleContainerVolumes:Types"
            volume={volume}
            index={index}
          />
        </FormGroup>
      </FormRow>
      <FormRow>
        <FormGroup className="column-4" showError={Boolean(profileNameError)}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Profile Name
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldAutofocus>
            <FieldInput
              name={`volumes.${index}.profileName`}
              type="text"
              value={volume.profileName}
            />
          </FieldAutofocus>
          <FieldError>{containerPathError}</FieldError>
        </FormGroup>
        <FormGroup className="column-4" showError={Boolean(containerPathError)}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Container Path
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldInput
            name={`volumes.${index}.containerPath`}
            type="text"
            value={volume.containerPath}
          />
          <FieldError>{containerPathError}</FieldError>
        </FormGroup>
        <FormGroup className="column-2" showError={Boolean(sizeError)}>
          <FieldLabel className="text-no-transform">
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                SIZE (MiB)
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldInput
            name={`volumes.${index}.size`}
            type="number"
            value={volume.size}
          />
          <FieldError>{sizeError}</FieldError>
        </FormGroup>
      </FormRow>
    </div>
  );
}
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
    // Hooks.addFilter etc.
  }
};
