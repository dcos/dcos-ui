import { Trans } from "@lingui/macro";
import * as React from "react";
import PropTypes from "prop-types";

import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupContainer from "#SRC/js/components/form/FormGroupContainer";
import FormRow from "#SRC/js/components/form/FormRow";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FieldSelect from "#SRC/js/components/form/FieldSelect";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import { getFieldError } from "#PLUGINS/jobs/src/js/components/form/helpers/ErrorUtil";

import EnvironmentVariableInput from "./EnvironmentVariableInput";
import SecretInput from "./SecretInput";
import JobFileInput from "./JobFileInput";

const JobSecret = (props) => {
  const {
    secretIndex,
    secret,
    secrets,
    onRemoveItem,
    errors,
    showErrors,
  } = props;

  const secretError = getFieldError(`run.secrets.${secret.key}`, errors);
  const envValueError = getFieldError(`run.secrets.${secretIndex}`, errors);
  const fileSecretError = getFieldError(
    `run.secrets.${secret.key}.file`,
    errors
  );

  const exposureValue =
    secret.exposureType === "file" ? (
      <JobFileInput
        name={`job.run.secrets.${secretIndex}.exposureValue`}
        value={secret.exposureValue || ""}
        error={showErrors ? fileSecretError : null}
        duplicateValue={props.duplicateValue}
        autoFocus={showErrors && fileSecretError}
      />
    ) : (
      <EnvironmentVariableInput
        name={`job.run.secrets.${secretIndex}.exposureValue`}
        value={secret.exposureValue || ""}
        error={showErrors ? envValueError : null}
        autoFocus={showErrors && envValueError}
      />
    );

  const typeSelect = (
    <FormGroup className="column-4" required={false}>
      <FieldLabel>
        <FormGroupHeadingContent>
          <Trans render="span">Expose as</Trans>
        </FormGroupHeadingContent>
      </FieldLabel>
      <FieldSelect
        name={`job.run.secrets.${secretIndex}.exposureType`}
        type="text"
        value={secret.exposureType || ""}
      >
        <Trans render={<option value="" disabled={true} />}>Select ...</Trans>
        <Trans render={<option value="envVar" />}>Environment Variable</Trans>
        <Trans render={<option value="file" />}>File</Trans>
      </FieldSelect>
    </FormGroup>
  );

  const valueRow = (
    <FormRow>
      {typeSelect}
      {secret.exposureType && exposureValue}
    </FormRow>
  );

  const showValue =
    (secret.secretPath && secret.secretPath.length > 0) ||
    (secret.exposureType &&
      secret.exposureType.length > 0 &&
      secret.exposureValue &&
      secret.exposureValue.length > 0);

  return (
    <FormGroupContainer
      key={secret.key}
      onRemove={onRemoveItem("job.run.secrets", secretIndex)}
    >
      <FormRow>
        <FormGroup
          className="column-6"
          required={false}
          showError={Boolean(showErrors && secretError)}
        >
          <FieldLabel>
            <FormGroupHeading>
              <Trans render={<FormGroupHeadingContent primary={true} />}>
                Secret
              </Trans>
            </FormGroupHeading>
          </FieldLabel>
          <FieldAutofocus>
            <SecretInput
              name={`job.run.secrets.${secretIndex}.secretPath`}
              value={secret.secretPath || ""}
              secrets={secrets}
              externalList={true}
            />
          </FieldAutofocus>
          <Trans render={<FieldHelp />}>
            Unique value is also allowed for one-time use
          </Trans>
          <FieldError>{secretError}</FieldError>
        </FormGroup>
      </FormRow>
      {showValue ? valueRow : null}
    </FormGroupContainer>
  );
};

JobSecret.propTypes = {
  secretIndex: PropTypes.number.isRequired,
  secret: PropTypes.shape({
    exposureType: PropTypes.string,
    exposureValue: PropTypes.string,
    key: PropTypes.string,
    secretPath: PropTypes.string,
  }),
  secrets: PropTypes.arrayOf(PropTypes.string),
  valueWithoutKey: PropTypes.bool,
  duplicateValue: PropTypes.bool,
  onRemoveItem: PropTypes.func.isRequired,
};

export default JobSecret;
