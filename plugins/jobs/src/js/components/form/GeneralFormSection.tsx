import { Trans } from "@lingui/macro";
import * as React from "react";
import { Tooltip } from "reactjs-components";

import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormRow from "#SRC/js/components/form/FormRow";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FieldError from "#SRC/js/components/form/FieldError";
import { FormOutput, FormError } from "./helpers/JobFormData";

interface GeneralProps {
  formData: FormOutput;
  errors: FormError[];
  showErrors: boolean;
}

function getFieldError(path: string, errors: FormError[]) {
  return errors
    .filter(e => {
      const match = e.path.join(".");
      return match === path;
    })
    .map(e => e.message)
    .join(" ");
}

class GeneralFormSection extends React.Component<GeneralProps> {
  constructor(props: Readonly<GeneralProps>) {
    super(props);
  }

  getResourceRow() {
    const { formData, showErrors, errors } = this.props;
    const cpuTooltipContent = (
      <Trans>
        The number of CPU shares this job needs per instance. This number does
        not have to be integer, but can be a fraction.
      </Trans>
    );
    const gpuTooltipContent = (
      <Trans>
        The number of GPU shares this job needs per instance. Only available
        with the UCR runtime.
      </Trans>
    );
    const gpusDisabled = formData.cmdOnly || formData.container !== "ucr";

    const cpusError = getFieldError("job.run.cpus", errors);
    const gpusError = getFieldError("job.run.gpus", errors);
    const memError = getFieldError("job.run.mem", errors);
    const diskError = getFieldError("job.run.disk", errors);

    return (
      <FormRow>
        <FormGroup className="column-3" showError={showErrors && cpusError}>
          <FieldLabel>
            <FormGroupHeading required={true}>
              <FormGroupHeadingContent title="CPUs" primary={true}>
                <Trans render="span">CPUs</Trans>
              </FormGroupHeadingContent>
              <FormGroupHeadingContent title="CPUs Info">
                <Tooltip
                  content={cpuTooltipContent}
                  interactive={true}
                  maxWidth={300}
                  wrapText={true}
                >
                  <InfoTooltipIcon />
                </Tooltip>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldInput type="number" name="job.run.cpus" value={formData.cpus} />
          <FieldError>{cpusError}</FieldError>
        </FormGroup>

        <FormGroup className="column-3" showError={showErrors && memError}>
          <FieldLabel className="text-no-transform">
            <FormGroupHeading required={true}>
              <FormGroupHeadingContent title="Mem">
                <Trans render="span">Mem (MiB)</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldInput name="job.run.mem" type="number" value={formData.mem} />
          <FieldError>{memError}</FieldError>
        </FormGroup>

        <FormGroup className="column-3" showError={showErrors && diskError}>
          <FieldLabel className="text-no-transform">
            <FormGroupHeading required={true}>
              <FormGroupHeadingContent title="Disk">
                <Trans render="span">Disk (MiB)</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldInput name="job.run.disk" type="number" value={formData.disk} />
          <FieldError>{diskError}</FieldError>
        </FormGroup>

        <FormGroup className="column-3" showError={showErrors && gpusError}>
          <FieldLabel className="text-no-transform">
            <FormGroupHeading>
              <FormGroupHeadingContent title="GPUs">
                <Trans render="span">GPUs</Trans>
              </FormGroupHeadingContent>
              <FormGroupHeadingContent title="GPUs Info">
                <Tooltip
                  content={gpuTooltipContent}
                  interactive={true}
                  maxWidth={300}
                  wrapText={true}
                >
                  <InfoTooltipIcon />
                </Tooltip>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldInput
            name="job.run.gpus"
            type="number"
            disabled={gpusDisabled}
            value={formData.gpus}
          />
          <FieldError>{gpusError}</FieldError>
        </FormGroup>
      </FormRow>
    );
  }

  getJobType() {
    const { formData, errors, showErrors } = this.props;
    const cmdTooltipContent = (
      <Trans>
        The command that is executed. This value is wrapped by Mesos via
        `/bin/sh -c job.cmd`. Either `cmd` or `args` must be supplied. It is
        invalid to supply both `cmd` and `args` in the same job.
      </Trans>
    );
    const containerImage = formData.containerImage;

    const containerImageErrors =
      getFieldError("job.run.docker.image", errors) ||
      getFieldError("job.run.ucr.image.id", errors);
    const cmdErrors = getFieldError("job.run.cmd", errors);

    return (
      <div className="form-section">
        <Trans render="h2" className="flush-top short-bottom">
          Job Type
        </Trans>
        <Trans render="p">
          Select command only or container image with optional command.
        </Trans>
        <FormGroup>
          <FieldLabel>
            <FieldInput
              checked={formData.cmdOnly}
              name="cmdOnly"
              type="radio"
              value={true}
            />
            <Trans render="span">Command Only</Trans>
          </FieldLabel>
          <FieldLabel>
            <FieldInput
              checked={!formData.cmdOnly}
              name="cmdOnly"
              type="radio"
              value={false}
            />
            <Trans render="span">Container Image</Trans>
          </FieldLabel>
        </FormGroup>
        {!formData.cmdOnly && (
          <FormRow>
            <FormGroup
              className="column-12"
              showError={showErrors && containerImageErrors}
            >
              <FieldLabel>
                <FormGroupHeading required={!formData.cmdOnly}>
                  <FormGroupHeadingContent
                    title="Container Image"
                    primary={true}
                  >
                    <Trans render="span">Container Image</Trans>
                  </FormGroupHeadingContent>
                  <FormGroupHeadingContent title="Container Image Info">
                    <Tooltip
                      content={cmdTooltipContent}
                      interactive={true}
                      maxWidth={300}
                      wrapText={true}
                    >
                      <InfoTooltipIcon />
                    </Tooltip>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldAutofocus>
                <FieldInput
                  name="containerImage"
                  type="text"
                  value={containerImage}
                />
              </FieldAutofocus>
              <FieldHelp>
                <Trans render="span">
                  Enter an image you want to run, e.g. ubuntu:14.04.
                </Trans>
              </FieldHelp>
              <FieldError>{containerImageErrors}</FieldError>
            </FormGroup>
          </FormRow>
        )}
        <FormRow>
          <FormGroup className="column-12" showError={showErrors && cmdErrors}>
            <FieldLabel>
              <FormGroupHeading required={formData.cmdOnly}>
                <FormGroupHeadingContent title="Command" primary={true}>
                  <Trans render="span">Command</Trans>
                </FormGroupHeadingContent>
                <FormGroupHeadingContent title="Command Info">
                  <Tooltip
                    content={cmdTooltipContent}
                    interactive={true}
                    maxWidth={300}
                    wrapText={true}
                  >
                    <InfoTooltipIcon />
                  </Tooltip>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
            <FieldAutofocus>
              <FieldInput name="job.run.cmd" type="text" value={formData.cmd} />
            </FieldAutofocus>
            <FieldHelp>
              <Trans render="span">
                A command to be run on the host or in the container.
              </Trans>
            </FieldHelp>
            <FieldError>{cmdErrors}</FieldError>
          </FormGroup>
        </FormRow>
      </div>
    );
  }

  render() {
    const { formData, errors, showErrors } = this.props;

    const idTooltipContent = (
      <Trans>
        Unique identifier for the job consisting of a series of names separated
        by dots. Each name must be at least 1 character and may only contain
        digits (`0-9`), dashes (`-`), and lowercase letters (`a-z`). The name
        may not begin or end with a dash.
      </Trans>
    );
    const descTooltipContent = <Trans>A description of this job.</Trans>;
    const idError = getFieldError("job.id", errors);

    return (
      <div className="form-section">
        <Trans render="h1" className="flush-top short-bottom">
          General
        </Trans>
        <FormRow>
          <FormGroup className="column-12" showError={showErrors && idError}>
            <FieldLabel>
              <FormGroupHeading required={true}>
                <FormGroupHeadingContent title="Job ID" primary={true}>
                  <Trans render="span">Job ID</Trans>
                </FormGroupHeadingContent>
                <FormGroupHeadingContent title="Job ID Info">
                  <Tooltip
                    content={idTooltipContent}
                    interactive={true}
                    maxWidth={300}
                    wrapText={true}
                  >
                    <InfoTooltipIcon />
                  </Tooltip>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
            <FieldAutofocus>
              <FieldInput name="job.id" type="text" value={formData.jobId} />
            </FieldAutofocus>
            <FieldError>{idError}</FieldError>
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup className="column-12" showError={false}>
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent title="Description" primary={true}>
                  <Trans render="span">Description</Trans>
                </FormGroupHeadingContent>
                <FormGroupHeadingContent title="Description Info">
                  <Tooltip
                    content={descTooltipContent}
                    interactive={true}
                    maxWidth={300}
                    wrapText={true}
                  >
                    <InfoTooltipIcon />
                  </Tooltip>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
            <FieldAutofocus>
              <FieldInput
                name="job.description"
                type="text"
                value={formData.description}
              />
            </FieldAutofocus>
          </FormGroup>
        </FormRow>
        {this.getResourceRow()}
        {this.getJobType()}
      </div>
    );
  }
}

export default GeneralFormSection;
