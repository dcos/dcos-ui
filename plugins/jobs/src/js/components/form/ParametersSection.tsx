import * as React from "react";
import { Trans } from "@lingui/macro";

import AddButton from "#SRC/js/components/form/AddButton";
import DeleteRowButton from "#SRC/js/components/form/DeleteRowButton";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormRow from "#SRC/js/components/form/FormRow";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldError from "#SRC/js/components/form/FieldError";
import { FormOutput, FormError, DockerParameter } from "./helpers/JobFormData";
import { getFieldError } from "./helpers/ErrorUtil";

interface ParametersSectionProps {
  formData: FormOutput;
  errors: FormError[];
  showErrors: boolean;
  onRemoveItem: (path: string, index: number) => void;
  onAddItem: (path: string) => void;
}

class ParametersSection extends React.Component<
  ParametersSectionProps,
  object
> {
  constructor(props: ParametersSectionProps) {
    super(props);
  }

  getParamsInputs() {
    const {
      formData: { dockerParams },
      onRemoveItem,
      errors,
      showErrors
    } = this.props;

    return dockerParams.map((parameter: DockerParameter, index: number) => {
      let nameLabel = null;
      let valueLabel = null;
      if (index === 0) {
        nameLabel = (
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans>Parameter Name</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
        );
        valueLabel = (
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans>Parameter Value</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
        );
      }
      const keyErrors = getFieldError(
        `job.run.docker.parameters.${index}.key`,
        errors
      );
      const valueErrors = getFieldError(
        `job.run.docker.parameters.${index}.value`,
        errors
      );
      const generalParamError = getFieldError(
        `job.run.docker.parameters.${index}`,
        errors
      );

      return (
        <FormRow key={index}>
          <FormGroup
            className="column-6"
            required={false}
            showError={Boolean(showErrors && (keyErrors || generalParamError))}
          >
            {nameLabel}
            <FieldAutofocus>
              <FieldInput
                name={`key.${index}.dockerParams`}
                type="text"
                value={parameter.key || ""}
              />
            </FieldAutofocus>
            <FieldError>{keyErrors}</FieldError>
            <span className="emphasis form-colon">:</span>
          </FormGroup>
          <FormGroup
            className="column-6"
            required={false}
            showError={Boolean(
              showErrors && (valueErrors || generalParamError)
            )}
          >
            {valueLabel}
            <FieldInput
              name={`value.${index}.dockerParams`}
              type="text"
              value={parameter.value || ""}
            />
            <FieldError>{valueErrors}</FieldError>
          </FormGroup>
          <FormGroup hasNarrowMargins={true} applyLabelOffset={index === 0}>
            <DeleteRowButton onClick={onRemoveItem("dockerParams", index)} />
          </FormGroup>
        </FormRow>
      );
    });
  }

  render() {
    const { onAddItem } = this.props;

    return (
      <div className="form-section">
        {this.getParamsInputs()}
        <FormRow>
          <FormGroup className="column-12">
            <AddButton onClick={onAddItem("dockerParams")}>
              <Trans>Add Parameter</Trans>
            </AddButton>
          </FormGroup>
        </FormRow>
      </div>
    );
  }
}

export default ParametersSection;
