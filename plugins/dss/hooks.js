/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import Objektiv from "objektiv";

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

const errorsLens = Objektiv.attr("container", {}).attr("volumes", []);

function getVolumeTypes(props) {
  return (
    <FieldSelect name={`volumes.${props.index}.type`} value={props.volume.type}>
      <option>Select...</option>,
      <option value="HOST">
        Host Volume
      </option>,
      <option value="DSS">DC/OS Storage Service</option>,
      <option value="PERSISTENT">Persistent Volume</option>,
      <option value="EXTERNAL">External Volume</option>
    </FieldSelect>
  );
}

function getDSSVolumeConfig(props) {
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
        <FormGroup className="column-4" showError={Boolean(typeError)}>
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
      getDSSVolumeConfig,
      "CreateService:SingleContainerVolumes:UnknonwVolumes"
    );

    MountService.MountService.registerComponent(
      getVolumeTypes,
      "CreateService:SingleContainerVolumes:Types"
    );
    // Hooks.addFilter etc.
  }
};
