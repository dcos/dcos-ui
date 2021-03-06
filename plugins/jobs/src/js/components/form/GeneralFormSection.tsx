import { Trans } from "@lingui/macro";
import * as React from "react";
import {
  SpacingBox,
  Typeahead,
  Textarea,
  TextInputWithBadges,
  TextInput,
  Tooltip,
} from "@dcos/ui-kit";

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
import {
  FormOutput,
  FormError,
  Action,
  JobFormActionType as A,
} from "./helpers/JobFormData";
import { fetchJobs } from "#SRC/js/events/MetronomeClient";
import dcosVersion$ from "#SRC/js/stores/dcos-version";

const getFieldError = (path: string, errors: FormError[]) =>
  errors
    .filter((e) => e.path.join(".") === path)
    .map((e) => e.message)
    .join(" ");

export default class GeneralFormSection extends React.Component<{
  formData: FormOutput;
  errors: FormError[];
  showErrors: boolean;
  isEdit: boolean;
  onChange: (a: Action) => void;
}> {
  state = { jobs: [], hasJobsWithDeps: false };

  componentWillMount() {
    dcosVersion$.subscribe(({ hasJobsWithDeps }) => {
      this.setState({ hasJobsWithDeps });
    });
  }
  public getResourceRow() {
    const { formData, showErrors, errors } = this.props;
    const gpusDisabled = !formData.cmdOnly && formData.container !== "ucr";

    const cpusError = getFieldError("run.cpus", errors);
    const gpusError = getFieldError("run.gpus", errors);
    const memError = getFieldError("run.mem", errors);
    const diskError = getFieldError("run.disk", errors);

    return (
      <FormRow>
        <FormGroup className="column-3" showError={showErrors && !!cpusError}>
          <TextInput
            required={true}
            inputLabel={<Trans id="CPUs" />}
            tooltipContent={
              <Trans id="The number of CPU shares this job needs per instance. This number does not have to be integer, but can be a fraction." />
            }
            type="number"
            name="job.run.cpus"
            value={formData.cpus}
            autoFocus={showErrors && !!cpusError}
          />
          <FieldError>{cpusError}</FieldError>
        </FormGroup>

        <FormGroup className="column-3" showError={showErrors && !!memError}>
          <TextInput
            required={true}
            inputLabel={<Trans id="Mem (MiB)" />}
            name="job.run.mem"
            type="number"
            value={formData.mem}
            autoFocus={showErrors && !!memError}
          />
          <FieldError>{memError}</FieldError>
        </FormGroup>

        <FormGroup className="column-3" showError={showErrors && !!diskError}>
          <TextInput
            required={true}
            inputLabel={<Trans id="Disk (MiB)" />}
            name="job.run.disk"
            type="number"
            value={formData.disk}
            autoFocus={showErrors && !!diskError}
          />
          <FieldError>{diskError}</FieldError>
        </FormGroup>

        <FormGroup className="column-3" showError={showErrors && !!gpusError}>
          <TextInput
            inputLabel={<Trans id="GPUs" />}
            tooltipContent={
              <Trans id="The number of GPU shares this job needs per instance. Only available with the UCR runtime." />
            }
            name="job.run.gpus"
            type="number"
            disabled={gpusDisabled}
            value={formData.gpus}
            autoFocus={showErrors && !!gpusError}
          />
          <FieldError>{gpusError}</FieldError>
        </FormGroup>
      </FormRow>
    );
  }

  public getJobType() {
    const { formData, errors, showErrors } = this.props;
    const containerImage = formData.containerImage;
    const containerImageErrors =
      getFieldError("run.docker.image", errors) ||
      getFieldError("run.ucr.image.id", errors);
    const cmdErrors = getFieldError("run.cmd", errors);

    return (
      <div className="form-section">
        <Trans render="h2" className="short-bottom">
          Job Type
        </Trans>
        <Trans render="p">
          Select command only or container image with optional command.
        </Trans>
        <FormGroup>
          <FieldLabel>
            <FieldInput
              checked={!formData.cmdOnly}
              name="cmdOnly"
              type="radio"
              value={"false"}
            />
            <Trans render="span">Container Image</Trans>
          </FieldLabel>
          <FieldLabel>
            <FieldInput
              checked={formData.cmdOnly}
              name="cmdOnly"
              type="radio"
              value={"true"}
            />
            <Trans render="span">Command Only</Trans>
          </FieldLabel>
        </FormGroup>
        {!formData.cmdOnly && (
          <FormRow>
            <FormGroup
              className="column-12"
              showError={showErrors && !!containerImageErrors}
            >
              <FieldAutofocus>
                <TextInput
                  inputLabel={
                    <span>
                      <Trans id="Container Image" />*
                    </span>
                  }
                  name="containerImage"
                  tooltipContent={<Trans id="The repository image name." />}
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
          <FormGroup
            className="column-12"
            showError={showErrors && !!cmdErrors}
          >
            <FieldAutofocus>
              <Textarea
                inputLabel={
                  <FormGroupHeading required={formData.cmdOnly}>
                    <FormGroupHeadingContent title="Command" primary={true}>
                      <Trans id="Command" />
                    </FormGroupHeadingContent>
                    <FormGroupHeadingContent title="Command Info">
                      <Tooltip
                        id="cmdtt"
                        maxWidth={300}
                        trigger={<InfoTooltipIcon />}
                      >
                        <Trans id="The command that is executed. This value is wrapped by Mesos via `/bin/sh -c job.cmd`. Either `cmd` or `args` must be supplied. It is invalid to supply both `cmd` and `args` in the same job." />
                      </Tooltip>
                    </FormGroupHeadingContent>
                  </FormGroupHeading>
                }
                name="job.run.cmd"
                value={formData.cmd}
              />
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

  public render() {
    const { formData, errors, showErrors, isEdit } = this.props;

    const idError = getFieldError("id", errors);

    return (
      <div className="form-section">
        <Trans render="h1" className="flush-top short-bottom">
          General
        </Trans>
        <FormRow>
          <FormGroup className="column-12" showError={showErrors && !!idError}>
            <FieldAutofocus>
              <TextInput
                name="job.id"
                disabled={isEdit}
                required={true}
                inputLabel={<Trans id="Job ID" />}
                tooltipContent="Unique identifier for the job consisting of a series of names separated by dots. Each name must be at least 1 character and may only contain digits (`0-9`), dashes (`-`), and lowercase letters (`a-z`). The name may not begin or end with a dash."
                value={formData.jobId}
              />
            </FieldAutofocus>
            <FieldError>{idError}</FieldError>
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup className="column-12" showError={false}>
            <FieldAutofocus>
              <TextInput
                name="job.description"
                value={formData.description}
                inputLabel="Description"
                tooltipContent={<Trans id="A description of this job." />}
              />
            </FieldAutofocus>
          </FormGroup>
        </FormRow>
        {this.getResourceRow()}

        {this.state.hasJobsWithDeps && (
          <DependencyPicker
            exclude={[formData.jobId]}
            deps={formData.dependencies || []}
            onChange={this.props.onChange}
            error={getFieldError("dependencies", errors)}
          />
        )}

        {this.getJobType()}
      </div>
    );
  }
}

const setDeps = (value) => ({ path: "job.dependencies", type: A.Set, value });
type Option = { label: string; value: string };
const DependencyPicker: React.FC<{
  deps: Array<{ id: string }>;
  exclude?: string[];
  onChange: (a: Action) => void;
  error: string;
}> = ({ deps = [], exclude = [], onChange, error }) => {
  const [q, setQ] = React.useState("");
  const [jobs, setJobs] = React.useState<Option[]>([]);

  React.useEffect(() => {
    fetchJobs().subscribe(({ response }) =>
      setJobs(
        response
          .filter(({ id }) => !exclude.includes(id))
          .map(({ id }) => ({ label: id, value: id }))
      )
    );
  }, []);

  const filteredJobs = jobs.filter(
    ({ label }) => label.includes(q) && !deps.map((d) => d.id).includes(label)
  );
  const addJob = ([id]: string[]) => {
    setQ("");
    onChange(setDeps([...deps, { id }]));
  };
  const badgeChangeHandler = (leftoverBadges: Array<{ value: string }>) => {
    onChange(setDeps([...leftoverBadges.map((b) => ({ id: b.value }))]));
  };
  const onChangeQ = (e) => {
    setQ(e.currentTarget.value);
    e.stopPropagation();
  };

  const toBadge = ({ id }) => ({ value: id, label: id });

  return (
    <FormRow>
      <FormGroup className="column-12" showError={!!error}>
        <Typeahead
          items={filteredJobs}
          overlayRoot={document.querySelector<HTMLElement>(".modal-wrapper")!}
          resetInputOnSelect={true}
          menuEmptyState={
            <SpacingBox>
              <Trans id="No more jobs to choose from." />
            </SpacingBox>
          }
          textField={
            <TextInputWithBadges
              badges={deps.map(toBadge)}
              inputLabel={<Trans id="Dependencies" />}
              onBadgeChange={badgeChangeHandler}
              onChange={onChangeQ}
              placeholder={deps.length ? "" : "Select a Job"}
              tooltipContent={
                <Trans id="This job will run whenever its last successful run is older than all of its dependencies' latest successful runs." />
              }
              value={q}
            />
          }
          onSelect={addJob}
        />

        <FieldError>{error}</FieldError>
      </FormGroup>
    </FormRow>
  );
};
