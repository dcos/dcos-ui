import * as React from "react";
// @ts-ignore
import { MountService } from "foundation-ui";
import { Tooltip } from "reactjs-components";
import { Trans } from "@lingui/macro";

import AddButton from "#SRC/js/components/form/AddButton";
import DeleteRowButton from "#SRC/js/components/form/DeleteRowButton";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import { FormOutput, FormError } from "./helpers/JobFormData";
import { getFieldError } from "./helpers/ErrorUtil";

function getEnvironmentLines(
  data: FormOutput["env"] = [],
  errors: FormError[],
  onRemoveItem: (path: string, index: number) => void
) {
  return data.map(([key, value], i) => {
    const error = getFieldError(`job.run.env.${i}`, errors);
    return (
      <FormRow key={`env-row-${i}`}>
        <FormGroup className="column-6" required={false} showError={!!error}>
          <FieldAutofocus>
            <FieldInput name={`0.${i}.env`} type="text" value={key || ""} />
          </FieldAutofocus>
          <FieldError>{error}</FieldError>
          <span className="emphasis form-colon">:</span>
        </FormGroup>
        <FormGroup className="column-6" required={false} showError={!!error}>
          <FieldInput name={`1.${i}.env`} type="text" value={value || ""} />
          <FieldError>{error}</FieldError>
        </FormGroup>
        <FormGroup hasNarrowMargins={true}>
          <DeleteRowButton onClick={onRemoveItem("job.run.env", i)} />
        </FormGroup>
      </FormRow>
    );
  });
}

function EnvironmentFormSection(props: {
  formData: FormOutput;
  errors: FormError[];
  showErrors: boolean;
  onRemoveItem: (path: string, index: number) => void;
  onAddItem: (path: string) => void;
}): JSX.Element {
  const { formData, errors } = props;

  // prettier-ignore
  const envTooltipContent = (
      <Trans render="span">
        DC/OS also exposes environment variables for host ports and metdata.{" "}
        <a
          href={MetadataStore.buildDocsURI(
            "/deploying-services/service-ports/#environment-variables"
          )}
          target="_blank"
        >
          More information
        </a>.
      </Trans>
    );

  const environmentLines = getEnvironmentLines(
    formData.env,
    errors,
    props.onRemoveItem
  ); // TODO errors.env

  return (
    <div>
      <h1 className="flush-top short-bottom">
        <FormGroupHeading>
          <FormGroupHeadingContent>
            <Trans render="span">Environment</Trans>
          </FormGroupHeadingContent>
        </FormGroupHeading>
      </h1>
      <Trans render="p">
        Configure any environment values to be attached to each instance that is
        launched.
      </Trans>
      <h2 className="short-bottom">
        <FormGroupHeading>
          <FormGroupHeadingContent>
            <Trans render="span">Environment Variables</Trans>
          </FormGroupHeadingContent>
          <FormGroupHeadingContent>
            <Tooltip
              content={envTooltipContent}
              interactive={true}
              maxWidth={300}
              wrapText={true}
            >
              <InfoTooltipIcon />
            </Tooltip>
          </FormGroupHeadingContent>
        </FormGroupHeading>
      </h2>
      <Trans render="p">
        Set up environment variables for each instance your service launches.
      </Trans>
      {environmentLines.length > 0 ? (
        <FormRow>
          <FormGroup className="column-6 short-bottom">
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent>
                  <Trans>Key</Trans>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
          </FormGroup>
          <FormGroup className="column-6 short-bottom">
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent>
                  <Trans>Value</Trans>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
          </FormGroup>
          {/* add an invisible fake-button here, so flexbox calculates the widths of the labels above taking into account that the following rows have a button */}
          <div style={{ visibility: "hidden", height: "0" }}>
            <DeleteRowButton />
          </div>
        </FormRow>
      ) : null}
      {environmentLines}
      <FormRow>
        <FormGroup className="column-12">
          <AddButton onClick={props.onAddItem("job.run.env")}>
            <Trans render="span">Add Environment Variable</Trans>
          </AddButton>
        </FormGroup>
      </FormRow>
    </div>
  );
}

export default EnvironmentFormSection;
