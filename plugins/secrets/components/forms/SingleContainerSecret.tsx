import * as React from "react";
import PropTypes from "prop-types";

import FormGroupContainer from "#SRC/js/components/form/FormGroupContainer";
import FormRow from "#SRC/js/components/form/FormRow";

import SecretFormInput from "./SecretFormInput";
import SecretExposureTypeSelect from "./SecretExposureTypeSelect";
import EnvironmentVariableInput from "./EnvironmentVariableInput";
import SingleContainerFileInput from "./SingleContainerFileInput";

function valueRow(props) {
  const { secretIndex, variableIndex, variable } = props;

  let exposureValue;
  exposureValue = null;
  const valueName = `secrets.${secretIndex}.exposures.${variableIndex}.value`;
  switch (variable.type) {
    case "file":
      exposureValue = (
        <SingleContainerFileInput
          name={valueName}
          value={variable.value || ""}
          showErrors={props.showErrors}
          errors={props.errors}
        />
      );
      break;
    case "envVar":
      exposureValue = (
        <EnvironmentVariableInput
          name={valueName}
          value={variable.value || ""}
          showErrors={props.showErrors}
          errors={props.errors}
        />
      );
      break;
  }

  return (
    <FormRow>
      <SecretExposureTypeSelect
        secretIndex={secretIndex}
        variableIndex={variableIndex}
        type={variable.type}
      />
      {exposureValue}
    </FormRow>
  );
}

const SingleContainerSecret = (props) => {
  const {
    secretIndex,
    variableIndex,
    secret,
    secrets,
    variable,
    onRemoveItem,
  } = props;
  const secretKey = secret.key || `secret${secretIndex}`;

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

  return (
    <FormGroupContainer
      key={`${secretIndex}-${variableIndex}`}
      onRemove={() => onRemoveItem(removeTransaction)}
    >
      <FormRow>
        <SecretFormInput
          secretKey={secretKey}
          index={secretIndex}
          value={secret.value}
          secrets={secrets}
          showErrors={props.showErrors}
          errors={props.errors}
        />
      </FormRow>
      {showValue ? valueRow(props) : null}
    </FormGroupContainer>
  );
};

SingleContainerSecret.propTypes = {
  secretIndex: PropTypes.number.isRequired,
  variableIndex: PropTypes.number.isRequired,
  secret: PropTypes.shape({
    exposures: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.oneOf(["", "file", "envVar"]),
        value: PropTypes.string,
      })
    ),
    key: PropTypes.string,
    value: PropTypes.string,
  }),
  secrets: PropTypes.arrayOf(PropTypes.string),
  variable: PropTypes.shape({
    type: PropTypes.oneOf(["", "file", "envVar"]),
    value: PropTypes.string,
  }),
  showErrors: PropTypes.bool.isRequired,
  errors: PropTypes.object,
  onRemoveItem: PropTypes.func.isRequired,
};

export default SingleContainerSecret;
