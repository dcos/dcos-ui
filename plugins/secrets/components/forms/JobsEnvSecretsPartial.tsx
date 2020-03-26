import * as React from "react";
import { Trans } from "@lingui/macro";

import AddButton from "#SRC/js/components/form/AddButton";
import DeleteRowButton from "#SRC/js/components/form/DeleteRowButton";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";
import FieldError from "#SRC/js/components/form/FieldError";
import {
  FormOutput,
  FormError,
} from "#PLUGINS/jobs/src/js/components/form/helpers/JobFormData";
import { getFieldError } from "#PLUGINS/jobs/src/js/components/form/helpers/ErrorUtil";
import SecretInput from "./SecretInput";

interface JobEnvSecretsPartialProps {
  formData: FormOutput;
  errors: FormError[];
  showErrors: boolean;
  onRemoveItem: (path: string, index: number) => void;
  onAddItem: (path: string) => void;
  secrets: string[];
}

function getSecretsLines(
  data: FormOutput,
  errors: FormError[],
  onRemoveItem: (path: string, index: number) => void,
  availableSecrets: string[],
  showErrors: boolean
) {
  const { secrets = [] } = data;
  return secrets.map(({ exposureValue, key, secretPath }, i) => {
    const secretErrors = getFieldError(`job.run.secrets.${key}`, errors);
    const nameErrors = getFieldError(`job.run.secrets.${i}`, errors);
    const envErrors = getFieldError(`job.run.env.${exposureValue}`, errors);
    return (
      <FormRow key={`secret-row-${i}`}>
        <FormGroup
          className="column-6"
          required={false}
          showError={Boolean(showErrors && secretErrors)}
        >
          <FieldAutofocus>
            <SecretInput
              name={`secret.${i}.secrets`}
              value={secretPath || ""}
              secrets={availableSecrets}
            />
          </FieldAutofocus>
          <FieldError>{secretErrors}</FieldError>
          <span className="emphasis form-colon">:</span>
        </FormGroup>
        <FormGroup
          className="column-6"
          required={false}
          showError={Boolean(showErrors && (nameErrors || envErrors))}
        >
          <FieldInput
            name={`name.${i}.secrets`}
            type="text"
            value={exposureValue || ""}
          />
          <FieldError>
            {nameErrors ? `${nameErrors} ${envErrors}` : envErrors}
          </FieldError>
        </FormGroup>
        <FormGroup hasNarrowMargins={true}>
          <DeleteRowButton onClick={onRemoveItem("job.run.secrets", i)} />
        </FormGroup>
      </FormRow>
    );
  });
}

class JobsEnvSecretsPartial extends React.Component<
  JobEnvSecretsPartialProps,
  {}
> {
  public render() {
    const {
      onRemoveItem,
      formData,
      errors,
      onAddItem,
      secrets,
      showErrors,
    } = this.props;

    const secretsLines = getSecretsLines(
      formData,
      errors,
      onRemoveItem,
      secrets,
      showErrors
    );

    return (
      <div>
        {secretsLines.length > 0 ? (
          <FormRow>
            <FormGroup className="column-6 short-bottom">
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent>
                    <Trans>Secret</Trans>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
            </FormGroup>
            <FormGroup className="column-6 short-bottom">
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent>
                    <Trans>Variable Name</Trans>
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
        {secretsLines}
        <FormRow>
          <FormGroup className="column-12">
            <AddButton onClick={onAddItem("job.run.secrets")}>
              <Trans render="span">Add Secret</Trans>
            </AddButton>
          </FormGroup>
        </FormRow>
      </div>
    );
  }
}

export default JobsEnvSecretsPartial;
