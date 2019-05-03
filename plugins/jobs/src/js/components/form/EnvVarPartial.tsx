import * as React from "react";
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
import { FormOutput, FormError } from "./helpers/JobFormData";
import { getFieldError } from "./helpers/ErrorUtil";

function getEnvironmentLines(
  data: FormOutput["env"] = [],
  errors: FormError[],
  onRemoveItem: (path: string, index: number) => void,
  showErrors: boolean
) {
  return data.map(([key, value], i) => {
    const valueError = getFieldError(`run.env.${key}.value.${i}`, errors);
    const keyError = getFieldError(`run.env.${key}.key`, errors);
    const envError = getFieldError(`run.env.${i}`, errors);
    return (
      <FormRow key={`env-row-${i}`}>
        <FormGroup
          className="column-6"
          required={false}
          showError={Boolean(showErrors && (keyError || envError))}
        >
          <FieldAutofocus>
            <FieldInput name={`0.${i}.env`} type="text" value={key || ""} />
          </FieldAutofocus>
          <FieldError>
            {envError ? `${envError} ${keyError}` : keyError}
          </FieldError>
          <span className="emphasis form-colon">:</span>
        </FormGroup>
        <FormGroup
          className="column-6"
          required={false}
          showError={Boolean(showErrors && valueError)}
        >
          <FieldInput name={`1.${i}.env`} type="text" value={value || ""} />
          <FieldError>{valueError}</FieldError>
        </FormGroup>
        <FormGroup hasNarrowMargins={true}>
          <DeleteRowButton onClick={onRemoveItem("job.run.env", i)} />
        </FormGroup>
      </FormRow>
    );
  });
}

interface EnvVarPartialProps {
  formData: FormOutput;
  errors: FormError[];
  showErrors: boolean;
  onRemoveItem: (path: string, index: number) => void;
  onAddItem: (path: string) => void;
}

class EnvVarPartial extends React.Component<EnvVarPartialProps, {}> {
  render() {
    const {
      onRemoveItem,
      formData,
      errors,
      onAddItem,
      showErrors
    } = this.props;

    const environmentLines = getEnvironmentLines(
      formData.env,
      errors,
      onRemoveItem,
      showErrors
    );

    // prettier-ignore
    const envTooltipContent = (
      <Trans render="span">
        DC/OS also exposes environment variables for host ports and metadata.
      </Trans>
    );

    return (
      <div>
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
            <AddButton onClick={onAddItem("job.run.env")}>
              <Trans render="span">Add Environment Variable</Trans>
            </AddButton>
          </FormGroup>
        </FormRow>
      </div>
    );
  }
}

export default EnvVarPartial;
