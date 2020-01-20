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

const JobFileInput = props => {
  const { name, value, duplicateValue, error, autoFocus } = props;

  const helpText = (
    <Trans>
      Enter in a container path & filename for this file-based secret.
    </Trans>
  );

  return (
    <FormGroup
      className="column-6"
      required={false}
      showError={Boolean(error) || duplicateValue}
    >
      <FieldLabel>
        <FormGroupHeading>
          <FormGroupHeadingContent primary={true}>
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
      <FieldInput name={name} type="text" value={value} autoFocus={autoFocus} />
      <FieldError>
        {error}
        {duplicateValue ? (
          <Trans>
            File name already in use by another secret for this service.
          </Trans>
        ) : null}
      </FieldError>
    </FormGroup>
  );
};

JobFileInput.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  error: PropTypes.string,
  duplicateValue: PropTypes.bool,
  autoFocus: PropTypes.bool
};

export default JobFileInput;
