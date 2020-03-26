import { Trans } from "@lingui/macro";
import * as React from "react";
import PropTypes from "prop-types";
import { Tooltip } from "reactjs-components";

import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";

interface Props extends HTMLInputElement {
  showErrors: boolean;
  errors: Record<string, Array<string | JSX.Element>>;
}

const EnvironmentVariableInput = (props: Props) => {
  const { name, value, errors, showErrors, autofocus } = props;
  const hasErrors =
    showErrors && errors && errors[name] && errors[name].length > 0;
  const helpText = (
    <Trans>
      Enter in an environment variable name for this environment variable-based
      secret.
    </Trans>
  );

  return (
    <FormGroup className="column-6" required={false} showError={hasErrors}>
      <FieldLabel>
        <FormGroupHeading>
          <FormGroupHeadingContent>
            <Trans render="span">Environment Variable Name</Trans>{" "}
            <Tooltip
              content={helpText}
              interactive={true}
              maxWidth={300}
              wrapperClassName="tooltip-wrapper text-align-center"
              wrapText={true}
            >
              <InfoTooltipIcon />
            </Tooltip>
          </FormGroupHeadingContent>
        </FormGroupHeading>
      </FieldLabel>
      <FieldInput name={name} value={value} autofocus={autofocus} />
      {hasErrors &&
        errors[name].map((error, errIndex) => (
          <FieldError key={`error-${errIndex}`}>{error}</FieldError>
        ))}
    </FormGroup>
  );
};

EnvironmentVariableInput.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  showErrors: PropTypes.bool,
  errors: PropTypes.object,
  autofocus: PropTypes.bool,
};

export default EnvironmentVariableInput;
