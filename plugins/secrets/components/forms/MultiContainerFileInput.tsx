import { Trans } from "@lingui/macro";
import * as React from "react";
import PropTypes from "prop-types";
import { Tooltip } from "reactjs-components";

import FormRow from "#SRC/js/components/form/FormRow";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import { getContainerNameWithIcon } from "#PLUGINS/services/src/js/utils/ServiceConfigDisplayUtil";

interface Props {
  name: string;
  values: string[];
  containers: unknown[];
  errors: Record<string, Array<string | JSX.Element>>;
  showErrors: boolean;
}

const MultiContainerFileInput = (props: Props): JSX.Element => {
  const { name, containers, values } = props;

  return (
    <React.Fragment>
      {containers.map((container: unknown, index: number) => {
        const fieldName = `${name}.${index}`;
        const mountPath = values.length > index ? values[index] : "";
        let errors: Array<string | JSX.Element> = [];
        if (props.errors && props.errors[fieldName]) {
          errors = props.errors[fieldName];
        }

        let containersLabel: null | JSX.Element = null;
        let inputLabel: null | JSX.Element = null;
        if (index === 0) {
          const helpText = (
            <Trans>
              Enter in a container path & filename for this file-based secret.
            </Trans>
          );
          containersLabel = (
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent primary={true}>
                  <Trans render="span">Containers</Trans>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
          );
          inputLabel = (
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
          );
        }

        return (
          <FormRow key={index}>
            <FormGroup className="column-3">
              {containersLabel}
              <div className="form-control-input-height">
                {getContainerNameWithIcon(container)}
              </div>
            </FormGroup>
            <FormGroup className="column-9" showError={props.showErrors}>
              {inputLabel}
              <FieldInput name={fieldName} type="text" value={mountPath} />
              {errors.map((error, index) => (
                <FieldError key={`error.${index}`}>{error}</FieldError>
              ))}
            </FormGroup>
          </FormRow>
        );
      })}
    </React.Fragment>
  );
};

MultiContainerFileInput.propTypes = {
  name: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.string).isRequired,
  containers: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
    })
  ),
  showErrors: PropTypes.bool,
  errors: PropTypes.object,
};

export default MultiContainerFileInput;
