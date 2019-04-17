import * as React from "react";
import { Trans } from "@lingui/macro";
import { withI18n } from "@lingui/react";
import { Tooltip, Select, SelectOption } from "reactjs-components";

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
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import MetadataStore from "#SRC/js/stores/MetadataStore";

import {
  FormOutput,
  FormError,
  PlacementConstraint
} from "./helpers/JobFormData";
import { getFieldError } from "./helpers/ErrorUtil";
import { OperatorTypes } from "./helpers/Constants";

interface PlacementSectionProps {
  formData: FormOutput;
  errors: FormError[];
  showErrors: boolean;
  onRemoveItem: (path: string, index: number) => void;
  onAddItem: (path: string) => void;
  i18n: any;
}

class PlacementSection extends React.Component<PlacementSectionProps, {}> {
  getPlacementInputs() {
    const {
      formData: { placementConstraints = [] },
      onRemoveItem,
      errors,
      showErrors,
      i18n
    } = this.props;

    return placementConstraints.map(
      (constraint: PlacementConstraint, index: number) => {
        let operatorLabel = null;
        let fieldLabel = null;
        let valueLabel = null;

        if (index === 0) {
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
        const isLastField = index === placementConstraints.length - 1;
        const operatorHelpText = isLastField ? (
          <Trans>Specify where your app will run.</Trans>
        ) : null;
        const fieldHelpText = isLastField ? <Trans>E.g hostname.</Trans> : null;

        const valueHelpText = isLastField ? (
          <Trans>A string, integer or regex value. </Trans>
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
                placeholder={"Select ..."}
              >
                {Object.keys(OperatorTypes).map((type, index) => {
                  const operatorType = (OperatorTypes as any)[type];
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
                })}
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
            <FormGroup hasNarrowMargins={true} applyLabelOffset={index === 0}>
              <DeleteRowButton onClick={onRemoveItem("dockerParams", index)} />
            </FormGroup>
          </FormRow>
        );
      }
    );
  }

  render() {
    const { onAddItem } = this.props;
    const placementTooltipContent = (
      <Trans render="span">
        Constraints have three parts: a field name, an operator, and an optional{" "}
        parameter. The field can be the hostname of the agent node or any{" "}
        attribute of the agent node.{" "}
        <a
          href={MetadataStore.buildDocsURI(
            "/deploying-services/marathon-constraints/"
          )}
          target="_blank"
        >
          More information
        </a>
        .
      </Trans>
    );

    return (
      <div className="form-section">
        <h1 className="flush-top short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              <Trans render="span">Placement Constraints</Trans>
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={placementTooltipContent}
                interactive={true}
                maxWidth={300}
                wrapText={true}
              >
                <InfoTooltipIcon />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h1>
        <div className="form-section">
          {this.getPlacementInputs()}
          <FormRow>
            <FormGroup className="column-12">
              <AddButton onClick={onAddItem("placementConstraints")}>
                <Trans>Add Placement Constraint</Trans>
              </AddButton>
            </FormGroup>
          </FormRow>
        </div>
      </div>
    );
  }
}

export default withI18n()(PlacementSection);
