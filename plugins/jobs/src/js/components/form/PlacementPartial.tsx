import * as React from "react";
import { Trans, t } from "@lingui/macro";
import { withI18n } from "@lingui/react";
import { Select, SelectOption } from "reactjs-components";

import FormGroup from "#SRC/js/components/form/FormGroup";
import FormRow from "#SRC/js/components/form/FormRow";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldError from "#SRC/js/components/form/FieldError";
import AddButton from "#SRC/js/components/form/AddButton";
import DeleteRowButton from "#SRC/js/components/form/DeleteRowButton";

import {
  FormOutput,
  FormError,
  PlacementConstraint
} from "./helpers/JobFormData";
import { getFieldError } from "./helpers/ErrorUtil";
import { OperatorTypes } from "./helpers/Constants";

interface PlacementPartialProps {
  formData: FormOutput;
  errors: FormError[];
  showErrors: boolean;
  onRemoveItem: (path: string, index: number) => void;
  onAddItem: (path: string) => void;
  i18n: any;
  addButtonText?: React.ReactNode;
  getIsGenericConstraint?: (constraint: PlacementConstraint) => boolean;
}

class PlacementPartial extends React.Component<PlacementPartialProps, {}> {
  getPlacementInputs() {
    const {
      formData: { placementConstraints = [] },
      onRemoveItem,
      errors,
      showErrors,
      i18n,
      getIsGenericConstraint
    } = this.props;
    let titleIndex = 0;

    return placementConstraints.map(
      (constraint: PlacementConstraint, index: number) => {
        if (getIsGenericConstraint && !getIsGenericConstraint(constraint)) {
          if (index === titleIndex) {
            titleIndex++;
          }
          return null;
        }
        let operatorLabel = null;
        let fieldLabel = null;
        let valueLabel = null;

        if (index === titleIndex) {
          operatorLabel = (
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent primary={true}>
                  <Trans>Operator</Trans>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
          );
          fieldLabel = (
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent primary={true}>
                  <Trans>Field</Trans>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
          );
          valueLabel = (
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent primary={true}>
                  <Trans>Value</Trans>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
          );
        }
        const lastIndex = placementConstraints.length - 1;
        let isLastField = lastIndex === index;
        if (getIsGenericConstraint) {
          isLastField = getIsGenericConstraint(placementConstraints[lastIndex])
            ? index === lastIndex
            : index === lastIndex - 1;
        }
        const operatorHelpText = isLastField ? (
          <Trans>Specify where your app will run.</Trans>
        ) : null;
        const fieldHelpText = isLastField ? <Trans>E.g hostname.</Trans> : null;

        const valueHelpText = isLastField ? (
          <Trans>A string or regex value. </Trans>
        ) : null;

        const valueIsRequired = (OperatorTypes[constraint.operator] || {})
          .requiresValue;
        const operatorErrors = getFieldError(
          `job.run.placement.constraints.${index}.operator`,
          errors
        );
        const fieldErrors = getFieldError(
          `job.run.placement.constraints.${index}.attribute`,
          errors
        );
        const valueErrors = getFieldError(
          `job.run.placement.constraints.${index}.value`,
          errors
        );
        const generalConstraintError = getFieldError(
          `job.run.placement.constraints.${index}`,
          errors
        );

        return (
          <FormRow key={index}>
            <FormGroup
              className="column-4"
              required={true}
              showError={Boolean(
                showErrors && (operatorErrors || generalConstraintError)
              )}
            >
              {operatorLabel}
              <Select
                name={`operator.${index}.placementConstraints`}
                value={String(constraint.operator)}
                placeholder={i18n._(t`Select ...`)}
              >
                {Object.entries(OperatorTypes).map(
                  ([type, operatorType], index) => {
                    return (
                      <SelectOption
                        key={index}
                        value={type}
                        label={i18n._(operatorType.name)}
                      >
                        <Trans
                          render="span"
                          id={operatorType.name}
                          className="dropdown-select-item-title"
                        />
                        <Trans
                          render="span"
                          id={operatorType.description}
                          className="dropdown-select-item-description"
                        />
                      </SelectOption>
                    );
                  }
                )}
              </Select>
              <FieldHelp>{operatorHelpText}</FieldHelp>
              <FieldError>{operatorErrors}</FieldError>
            </FormGroup>
            <FormGroup
              className="column-4"
              required={true}
              showError={Boolean(
                showErrors && (fieldErrors || generalConstraintError)
              )}
            >
              {fieldLabel}
              <FieldInput
                name={`attribute.${index}.placementConstraints`}
                type="text"
                value={constraint.attribute || ""}
              />
              <FieldHelp>{fieldHelpText}</FieldHelp>
              <FieldError>{fieldErrors}</FieldError>
            </FormGroup>
            <FormGroup
              className="column-4"
              required={valueIsRequired}
              showError={Boolean(
                showErrors && (valueErrors || generalConstraintError)
              )}
            >
              {valueLabel}
              <FieldInput
                name={`value.${index}.placementConstraints`}
                type="text"
                value={constraint.value || ""}
              />
              <FieldHelp>{valueHelpText}</FieldHelp>
              <FieldError>{valueErrors}</FieldError>
            </FormGroup>
            <FormGroup
              hasNarrowMargins={true}
              applyLabelOffset={index === titleIndex}
            >
              <DeleteRowButton
                onClick={onRemoveItem("placementConstraints", index)}
              />
            </FormGroup>
          </FormRow>
        );
      }
    );
  }

  render() {
    const { onAddItem, addButtonText } = this.props;

    return (
      <div className="form-section">
        {this.getPlacementInputs()}
        <FormRow>
          <FormGroup className="column-12">
            <AddButton onClick={onAddItem("placementConstraints")}>
              {addButtonText || <Trans>Add Placement Constraint</Trans>}
            </AddButton>
          </FormGroup>
        </FormRow>
      </div>
    );
  }
}

export default withI18n()(PlacementPartial);
