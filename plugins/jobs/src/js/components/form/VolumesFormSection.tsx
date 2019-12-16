import * as React from "react";
import { Trans } from "@lingui/macro";
import { Tooltip } from "reactjs-components";
import { MountService } from "foundation-ui";

import AddButton from "#SRC/js/components/form/AddButton";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FieldSelect from "#SRC/js/components/form/FieldSelect";
import FormGroup from "#SRC/js/components/form/FormGroup";
import DeleteRowButton from "#SRC/js/components/form/DeleteRowButton";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import {
  FormOutput,
  FormError,
  JobVolume,
  SecretVolume,
  VolumeMode
} from "./helpers/JobFormData";
import { getFieldError } from "./helpers/ErrorUtil";

interface VolumesSectionProps {
  formData: FormOutput;
  errors: FormError[];
  showErrors: boolean;
  onRemoveItem: (path: string, index: number) => void;
  onAddItem: (path: string) => void;
}

function isFBS(volume: JobVolume | SecretVolume): volume is SecretVolume {
  return volume.hasOwnProperty("secret");
}

class VolumesFormSection extends React.Component<VolumesSectionProps> {
  constructor(props: VolumesSectionProps) {
    super(props);
  }

  public getVolumesLines() {
    const {
      formData: { volumes = [] },
      onRemoveItem,
      errors,
      showErrors
    } = this.props;
    let firstIndex = 0;

    return (Array.isArray(volumes) ? volumes : []).map(
      (volume: JobVolume | SecretVolume, index: number) => {
        if (isFBS(volume)) {
          if (index === firstIndex) {
            firstIndex++;
          }
          return null;
        }
        let containerPathLabel = null;
        let hostPathLabel = null;
        let modeLabel = null;

        let mode: any = volume.mode;

        if (!(volume.mode === VolumeMode.RO || volume.mode === VolumeMode.RW)) {
          // If mode is changed to something not in the list (for ex: in the JSON editor),
          // show the default "Select ..." option
          mode = "";
        }

        if (index === firstIndex) {
          containerPathLabel = (
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent primary={true}>
                  <Trans>Container Path</Trans>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
          );
          hostPathLabel = (
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent primary={true}>
                  <Trans>Host Path</Trans>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
          );
          modeLabel = (
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent primary={true}>
                  <Trans>Mode</Trans>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
          );
        }

        const containerPathErrors = getFieldError(
          `run.volumes.${index}.containerPath`,
          errors
        );
        const hostPathErrors = getFieldError(
          `run.volumes.${index}.hostPath`,
          errors
        );
        const modeErrors = getFieldError(`run.volumes.${index}.mode`, errors);

        return (
          <FormRow key={`volume-${index}`}>
            <FormGroup
              className="column-4"
              required={true}
              showError={Boolean(showErrors && containerPathErrors)}
            >
              {containerPathLabel}
              <FieldAutofocus>
                <FieldInput
                  name={`containerPath.${index}.volumes`}
                  type="text"
                  value={volume.containerPath || ""}
                />
              </FieldAutofocus>
              <FieldError>{containerPathErrors}</FieldError>
            </FormGroup>
            <FormGroup
              className="column-4"
              required={true}
              showError={Boolean(showErrors && hostPathErrors)}
            >
              {hostPathLabel}
              <FieldInput
                name={`hostPath.${index}.volumes`}
                type="text"
                value={volume.hostPath || ""}
                autoFocus={Boolean(showErrors && hostPathErrors)}
              />
              <FieldError>{hostPathErrors}</FieldError>
            </FormGroup>
            <FormGroup
              className="column-4"
              required={true}
              showError={Boolean(showErrors && modeErrors)}
            >
              {modeLabel}
              <FieldSelect name={`mode.${index}.volumes`} value={mode}>
                <Trans render={<option value={""} disabled={true} />}>
                  Select ...
                </Trans>
                <Trans render={<option value={VolumeMode.RW} />}>
                  Read and Write
                </Trans>
                <Trans render={<option value={VolumeMode.RO} />}>
                  Read Only
                </Trans>
              </FieldSelect>
              <FieldError>{modeErrors}</FieldError>
            </FormGroup>
            <FormGroup
              hasNarrowMargins={true}
              applyLabelOffset={index === firstIndex}
            >
              <DeleteRowButton onClick={onRemoveItem("volumes", index)} />
            </FormGroup>
          </FormRow>
        );
      }
    );
  }

  public render() {
    const {
      onAddItem,
      formData: { volumes = [] }
    } = this.props;

    const tooltipContent = (
      <Trans>
        DC/OS offers several storage options.{" "}
        <a href={MetadataStore.buildDocsURI("/storage/")} target="_blank">
          More information
        </a>
        .
      </Trans>
    );
    const fbs = Array.isArray(volumes)
      ? volumes.filter(volume => isFBS(volume))
      : [];

    return (
      <div>
        <h1 className="flush-top short-bottom">
          <FormGroupHeading>
            <Trans render={<FormGroupHeadingContent primary={true} />}>
              Volumes
            </Trans>
            <FormGroupHeadingContent>
              <Tooltip
                content={tooltipContent}
                interactive={true}
                maxWidth={300}
                wrapText={true}
              >
                <InfoTooltipIcon />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h1>
        <Trans render="p">
          Create a stateful job by configuring a persistent volume. Persistent
          volumes enable instances to be restarted without data loss.
        </Trans>
        {this.getVolumesLines()}
        <FormRow>
          <FormGroup className="column-12">
            <AddButton onClick={onAddItem("volumes")}>
              <Trans render="span">Add Volume</Trans>
            </AddButton>
          </FormGroup>
        </FormRow>
        <MountService.Mount type="CreateJob:VolumesFBS" volumes={fbs} />
      </div>
    );
  }
}

export default VolumesFormSection;
