import * as React from "react";
import { Trans } from "@lingui/macro";
import { Tooltip } from "reactjs-components";

import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FormRow from "#SRC/js/components/form/FormRow";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FieldError from "#SRC/js/components/form/FieldError";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import { FormOutput, FormError, ConcurrentPolicy } from "./helpers/JobFormData";
import { getFieldError } from "./helpers/ErrorUtil";

interface ScheduleSectionProps {
  formData: FormOutput;
  errors: FormError[];
  showErrors: boolean;
}

class ScheduleFormSection extends React.Component<ScheduleSectionProps> {
  constructor(props: ScheduleSectionProps) {
    super(props);
  }

  render() {
    const { formData, showErrors, errors } = this.props;
    const idTooltipContent = (
      <Trans>
        Unique identifier for the job schedule of a string with at least 1
        character and may only contain digits (`0-9`), dashes (`-`), and
        lowercase letters (`a-z`). The id may not begin or end with a dash.
      </Trans>
    );
    const idErrors = getFieldError("schedule.id", errors);
    const cronErrors = getFieldError("schedule.cron", errors);
    const timezoneErrors = getFieldError("schedule.timezone", errors);
    const deadlineErrors = getFieldError(
      "schedule.startingDeadlineSeconds",
      errors
    );

    return (
      <div className="form-section">
        <Trans render="h1" className="short-bottom">
          Schedule
        </Trans>
        <div className="form-row-pad-bottom">
          <FieldLabel>
            <FieldInput
              checked={formData.scheduleEnabled}
              name="scheduleEnabled"
              type="checkbox"
              value={formData.scheduleEnabled}
            />
            <Trans>Enable schedule</Trans>
          </FieldLabel>
        </div>
        <FormRow>
          <FormGroup
            className="column-9"
            showError={Boolean(showErrors && idErrors)}
          >
            <FieldLabel>
              <FormGroupHeading required={true}>
                <FormGroupHeadingContent title="Schedule ID" primary={true}>
                  <Trans render="span">Schedule ID</Trans>
                </FormGroupHeadingContent>
                <FormGroupHeadingContent title="Schedule ID">
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
            <FieldInput
              name="schedule.id"
              type="text"
              value={formData.scheduleId}
            />
            <FieldError>{idErrors}</FieldError>
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup
            className="column-9"
            showError={Boolean(showErrors && cronErrors)}
          >
            <FieldLabel>
              <FormGroupHeading required={true}>
                <FormGroupHeadingContent title="CRON Schedule" primary={true}>
                  <Trans render="span">CRON Schedule</Trans>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
            <FieldInput
              name="schedule.cron"
              type="text"
              value={formData.cronSchedule}
            />
            <FieldHelp>
              <Trans render="span">
                Use cron format to set your schedule, e.g. 0 0 20 * *.{" "}
                <a
                  href={MetadataStore.buildDocsURI("/deploying-jobs/")}
                  target="_blank"
                >
                  View documentation
                </a>.
              </Trans>
            </FieldHelp>
            <FieldError>{cronErrors}</FieldError>
          </FormGroup>
          <FormGroup
            className="column-3"
            showError={Boolean(showErrors && timezoneErrors)}
          >
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent title="Timezone" primary={true}>
                  <Trans render="span">Time Zone</Trans>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
            <FieldInput
              name="schedule.timezone"
              type="text"
              value={formData.timezone}
            />
            <FieldError>{timezoneErrors}</FieldError>
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup
            className="column-9"
            showError={Boolean(showErrors && deadlineErrors)}
          >
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent
                  title="Starting Deadline"
                  primary={true}
                >
                  <Trans render="span">Starting Deadline</Trans>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
            <FieldInput
              name="schedule.startingDeadlineSeconds"
              type="number"
              value={formData.startingDeadline}
            />
            <FieldHelp>
              <Trans render="span">
                Time in seconds to start the job if it misses its scheduled
                time.
              </Trans>
            </FieldHelp>
            <FieldError>{deadlineErrors}</FieldError>
          </FormGroup>
        </FormRow>
        <div className="form-inner-section">
          <FormGroup>
            <FormGroupHeading>
              <FormGroupHeadingContent
                title="Concurrency Policy"
                primary={true}
              >
                <Trans render="p" className="form-checkbox-header">
                  Concurrency Policy
                </Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
            <FieldLabel>
              <FieldInput
                checked={formData.concurrentPolicy === ConcurrentPolicy.Allow}
                name="concurrentPolicy"
                type="checkbox"
                value={formData.concurrentPolicy}
              />
              <Trans>Allow</Trans>
            </FieldLabel>
          </FormGroup>
        </div>
      </div>
    );
  }
}

export default ScheduleFormSection;
