import { Trans } from "@lingui/macro";
import * as React from "react";
import PropTypes from "prop-types";

import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";

import SecretInput from "./SecretInput";

interface Props {
  secretKey: string;
  index: number;
  value?: string;
  secrets: string[];
  showErrors: boolean;
  errors: Record<string, Array<string | JSX.Element>>;
}

const SecretFormInput = (props: Props) => {
  const { secretKey, index, value, secrets, showErrors, errors } = props;
  const hasErrors =
    showErrors && errors && errors[secretKey] && errors[secretKey].length > 0;
  return (
    <FormGroup className="column-6" required={false} showError={hasErrors}>
      <FieldLabel>
        <FormGroupHeading>
          <Trans
            render={<FormGroupHeadingContent primary={true} title="Secret" />}
          >
            Secret
          </Trans>
        </FormGroupHeading>
      </FieldLabel>
      <FieldAutofocus>
        <SecretInput
          name={`secrets.${index}.value`}
          value={value || ""}
          secrets={secrets}
        />
      </FieldAutofocus>
      <Trans render={<FieldHelp />}>
        Unique value is also allowed for one-time use.
      </Trans>
      {hasErrors &&
        errors[secretKey].map((error, errIndex) => (
          <FieldError key={`error-${errIndex}`}>{error}</FieldError>
        ))}
    </FormGroup>
  );
};

SecretFormInput.propTypes = {
  secretKey: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  value: PropTypes.string,
  secrets: PropTypes.arrayOf(PropTypes.string).isRequired,
  showErrors: PropTypes.bool,
  errors: PropTypes.object
};

export default SecretFormInput;
