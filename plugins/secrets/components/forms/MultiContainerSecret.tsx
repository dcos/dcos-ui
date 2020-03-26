import * as React from "react";
import PropTypes from "prop-types";

import FormGroupContainer from "#SRC/js/components/form/FormGroupContainer";
import FormRow from "#SRC/js/components/form/FormRow";

import EnvironmentVariableInput from "./EnvironmentVariableInput";
import SecretFormInput from "./SecretFormInput";
import SecretExposureTypeSelect from "./SecretExposureTypeSelect";
import MultiContainerFileInput from "./MultiContainerFileInput";
import {
  MultiContainerSecretContext,
  MultiContainerSecretExposure,
} from "../../reducers/types";

interface Props {
  containers: unknown[];
  secretIndex: number;
  variableIndex: number;
  secret: MultiContainerSecretContext;
  secrets: string[];
  variable: MultiContainerSecretExposure;
  showErrors: boolean;
  errors: Record<string, Array<string | JSX.Element>>;
  onRemoveItem: (action: { path: string; value: number }) => void;
}

function containerRows(props: Props): null | JSX.Element {
  const {
    secretIndex,
    variableIndex,
    variable,
    containers,
    showErrors,
    errors,
  } = props;
  if (variable.type !== "file") {
    return null;
  }

  return (
    <MultiContainerFileInput
      name={`secrets.${secretIndex}.exposures.${variableIndex}.mounts`}
      values={variable.mounts || []}
      containers={containers}
      showErrors={showErrors}
      errors={errors}
    />
  );
}

function valueRow(props: Props) {
  const { secretIndex, variableIndex, variable } = props;
  switch (variable.type) {
    case "file":
      return (
        <FormRow>
          <SecretExposureTypeSelect
            secretIndex={secretIndex}
            variableIndex={variableIndex}
            type={variable.type}
          />
        </FormRow>
      );
    case "envVar":
      return (
        <FormRow>
          <SecretExposureTypeSelect
            secretIndex={secretIndex}
            variableIndex={variableIndex}
            type={variable.type}
          />
          <EnvironmentVariableInput
            name={`secrets.${secretIndex}.exposures.${variableIndex}.value`}
            value={variable.value || ""}
            showErrors={props.showErrors}
            errors={props.errors}
          />
        </FormRow>
      );
    default:
      return (
        <FormRow>
          <SecretExposureTypeSelect
            secretIndex={secretIndex}
            variableIndex={variableIndex}
            type={variable.type}
          />
        </FormRow>
      );
  }
}

const MultiContainerSecret = (props: Props) => {
  const {
    secretIndex,
    variableIndex,
    secret,
    secrets,
    variable,
    onRemoveItem,
    showErrors,
    errors,
  } = props;

  const removeTransaction =
    secret.exposures.length > 1
      ? { value: variableIndex, path: `secrets.${secretIndex}.exposures` }
      : { value: secretIndex, path: "secrets" };

  const showValue =
    (secret.value && secret.value.length > 0) ||
    (variable.type &&
      variable.type.length > 0 &&
      variable.value &&
      variable.value.length > 0);

  const removeHandler = () => {
    onRemoveItem(removeTransaction);
  };
  const secretKey = secret.key || `secret${secretIndex}`;

  return (
    <FormGroupContainer
      key={`${secretIndex}-${variableIndex}`}
      onRemove={removeHandler}
    >
      <FormRow>
        <SecretFormInput
          secretKey={secretKey}
          index={secretIndex}
          value={secret.value || ""}
          secrets={secrets}
          showErrors={showErrors}
          errors={errors}
        />
      </FormRow>
      {showValue ? valueRow(props) : null}
      {showValue ? containerRows(props) : null}
    </FormGroupContainer>
  );
};

MultiContainerSecret.propTypes = {
  secretIndex: PropTypes.number.isRequired,
  variableIndex: PropTypes.number.isRequired,
  secret: PropTypes.shape({
    exposures: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string,
        value: PropTypes.string,
        mounts: PropTypes.arrayOf(PropTypes.string),
      })
    ),
    key: PropTypes.string,
    value: PropTypes.string,
  }),
  secrets: PropTypes.arrayOf(PropTypes.string),
  variable: PropTypes.shape({
    type: PropTypes.string,
    value: PropTypes.string,
    mounts: PropTypes.arrayOf(PropTypes.string),
  }),
  showErrors: PropTypes.bool,
  errors: PropTypes.object,
  onRemoveItem: PropTypes.func.isRequired,
  containers: PropTypes.arrayOf(PropTypes.object),
};

export default MultiContainerSecret;
