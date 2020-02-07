import { Trans } from "@lingui/macro";

import * as React from "react";

import Objektiv from "objektiv";
import { MountService } from "foundation-ui";

import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";
import VolumeConstants from "#PLUGINS/services/src/js/constants/VolumeConstants";
import { omit } from "#SRC/js/utils/Util";
import { getContainerNameWithIcon } from "#PLUGINS/services/src/js/utils/ServiceConfigDisplayUtil";

const errorsLens = Objektiv.attr("container", {}).attr("volumes", []);

function getContainerMounts(containers, volumeMountIndex, volumeMounts) {
  return containers.map((container, containerIndex) => {
    let containersLabel = null;
    let pathLabel = null;
    if (containerIndex === 0) {
      containersLabel = (
        <FieldLabel>
          <FormGroupHeading>
            <Trans render={<FormGroupHeadingContent primary={true} />}>
              Containers
            </Trans>
          </FormGroupHeading>
        </FieldLabel>
      );
      pathLabel = (
        <FieldLabel>
          <FormGroupHeading>
            <Trans render={<FormGroupHeadingContent primary={true} />}>
              Container Path
            </Trans>
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
export default function(props) {
  const { volumes, index, offset } = props;
  if (volumes.type !== VolumeConstants.type.dss) {
    return (
      <div>
        <Trans render={<FieldLabel />}>Unable to edit this Volume</Trans>
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
        <FormGroup className="column-5" showError={false}>
          <FieldLabel>
            <FormGroupHeading>
              <Trans render={<FormGroupHeadingContent primary={true} />}>
                Volume Type
              </Trans>
            </FormGroupHeading>
          </FieldLabel>
          <MountService.Mount
            type="CreateService:MultiContainerVolumes:Types"
            volumes={volumes}
            index={index}
          />
        </FormGroup>
        <FormGroup className="column-6" showError={Boolean(nameError)}>
          <FieldLabel>
            <FormGroupHeading>
              <Trans render={<FormGroupHeadingContent primary={true} />}>
                Name
              </Trans>
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
              <Trans render={<FormGroupHeadingContent primary={true} />}>
                Profile Name
              </Trans>
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
              <Trans render={<FormGroupHeadingContent primary={true} />}>
                Size (GiB)
              </Trans>
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
