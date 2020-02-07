import { Trans } from "@lingui/macro";
import * as React from "react";
import PropTypes from "prop-types";
import { Tooltip } from "reactjs-components";

import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldError from "#SRC/js/components/form/FieldError";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";

const SingleContainerFileInput = props => {
  const { name, value, showErrors, errors } = props;
  const hasErrors =
    showErrors && errors && errors[name] && errors[name].length > 0;

  const helpText = (
    <Trans>
      Enter in a container path & filename for this file-based secret.
    </Trans>
  );

  return (
    <FormGroup className="column-6" required={false} showError={hasErrors}>
      <FieldLabel>
        <FormGroupHeading>
          <FormGroupHeadingContent primary={true} title="Container Path">
            <Trans render="span">Container Path & Filename</Trans>{" "}
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
      <FieldInput name={name} type="text" value={value} />
      {hasErrors &&
        errors[name].map((error, errIndex) => (
          <FieldError key={`error-${errIndex}`}>{error}</FieldError>
        ))}
    </FormGroup>
  );
};

SingleContainerFileInput.propTypes = {
  name: PropTypes.string.isRequired,
  showErrors: PropTypes.bool.isRequired,
  errors: PropTypes.object.isRequired,
  value: PropTypes.string
};

export default SingleContainerFileInput;
