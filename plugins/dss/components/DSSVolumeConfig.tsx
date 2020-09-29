import { Trans } from "@lingui/macro";

import * as React from "react";

import { MountService } from "foundation-ui";

import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";

export default function (props) {
  const { volume, index } = props;
  if (volume.type !== "DSS") {
    return null;
  }

  const errs = props.errors?.container?.volumes?.[index];
  const sizeError = errs?.persistent?.size;
  const profileNameError = errs?.persistent?.profileName;
  const containerPathError = errs?.containerPath;
  const typeError = errs?.type;

  return (
    <div>
      <FormRow>
        <FormGroup className="column-5" showError={Boolean(typeError)}>
          <FieldLabel>
            <FormGroupHeading>
              <Trans render={<FormGroupHeadingContent primary={true} />}>
                Volume Type
              </Trans>
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
              <Trans render={<FormGroupHeadingContent primary={true} />}>
                Profile Name
              </Trans>
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
              <Trans render={<FormGroupHeadingContent primary={true} />}>
                Container Path
              </Trans>
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
              <Trans render={<FormGroupHeadingContent primary={true} />}>
                Size (MiB)
              </Trans>
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
