import React, { Component } from "react";
import PropTypes from "prop-types";
import { Select, SelectOption } from "reactjs-components";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import DeleteRowButton from "#SRC/js/components/form/DeleteRowButton";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormRow from "#SRC/js/components/form/FormRow";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent
  from "#SRC/js/components/form/FormGroupHeadingContent";

import OperatorTypes from "#PLUGINS/services/src/js/constants/OperatorTypes";
import PlacementConstraintsUtil
  from "#PLUGINS/services/src/js/utils/PlacementConstraintsUtil";

// &nbsp; to space the table rows
const NBSP = "\u00A0";

export default class PlacementConstraintsField extends Component {
  getPlacementConstraintLabel(name) {
    return (
      <FieldLabel>
        <FormGroupHeading>
          <FormGroupHeadingContent primary={true}>
            {name}
          </FormGroupHeadingContent>
        </FormGroupHeading>
      </FieldLabel>
    );
  }

  render() {
    const { constraint, index, hideValueColumn, isLastField } = this.props;
    const constraintsErrors = findNestedPropertyInObject(
      this.props.errors,
      "constraints"
    );

    let fieldLabel = null;
    let operatorLabel = null;
    let valueLabel = null;
    const isFirstConstraint = index === 0;

    const valueIsRequired = PlacementConstraintsUtil.requiresValue(
      constraint.operator
    );
    const valueIsRequiredEmpty = PlacementConstraintsUtil.requiresEmptyValue(
      constraint.operator
    );
    const fieldNameError = findNestedPropertyInObject(
      constraintsErrors,
      `${index}.fieldName`
    );
    const operatorError = findNestedPropertyInObject(
      constraintsErrors,
      `${index}.operator`
    );
    const valueError = findNestedPropertyInObject(
      constraintsErrors,
      `${index}.value`
    );
    const commonFieldsClassNames = "column-4";

    if (isFirstConstraint) {
      fieldLabel = this.getPlacementConstraintLabel("Field");
      operatorLabel = this.getPlacementConstraintLabel("Operator");
      valueLabel = this.getPlacementConstraintLabel("Value");
    }

    const fieldValue = (
      <FieldInput
        name={`constraints.${index}.value`}
        type="text"
        value={constraint.value}
        disabled={!!valueIsRequiredEmpty}
      />
    );

    const typeSettings = OperatorTypes[constraint.operator];

    return (
      <FormRow key={index}>
        <FormGroup
          className={commonFieldsClassNames}
          required={true}
          showError={Boolean(operatorError)}
        >
          {operatorLabel}
          <Select
            name={`constraints.${index}.operator`}
            value={String(constraint.operator)}
            placeholder="Select ..."
          >
            {Object.keys(OperatorTypes).map((type, index) => {
              return (
                <SelectOption
                  key={index}
                  value={type}
                  label={OperatorTypes[type].name}
                >
                  <span className="dropdown-select-item-title">
                    {OperatorTypes[type].name}
                  </span>
                  <span className="dropdown-select-item-description">
                    {OperatorTypes[type].description}
                  </span>
                </SelectOption>
              );
            })}
          </Select>

          {operatorError && <FieldError>{operatorError}</FieldError>}
          {!operatorError &&
            <FieldHelp>
              {isLastField ? "Specify where your app will run." : NBSP}
            </FieldHelp>}
        </FormGroup>
        <FormGroup
          className={commonFieldsClassNames}
          required={true}
          showError={Boolean(fieldNameError)}
        >
          {fieldLabel}
          <FieldInput
            name={`constraints.${index}.fieldName`}
            type="text"
            placeholder="hostname"
            value={constraint.fieldName}
          />
          {fieldNameError && <FieldError>{fieldNameError}</FieldError>}
          {!fieldNameError &&
            <FieldHelp>{isLastField ? "E.g hostname." : NBSP}</FieldHelp>}
        </FormGroup>
        <FormGroup
          className={commonFieldsClassNames}
          required={valueIsRequired}
          showError={Boolean(valueError)}
        >
          {valueLabel}
          {valueIsRequiredEmpty
            ? this.getToolTip(fieldValue, typeSettings.tooltipContent)
            : fieldValue}
          {valueError &&
            <FieldError className={{ hidden: hideValueColumn }}>
              {valueError}
            </FieldError>}
          {!valueError &&
            <FieldHelp>
              {isLastField ? "A string, integer or regex value. " : NBSP}
              {typeSettings &&
                !typeSettings.requiresValue &&
                !typeSettings.requiresEmptyValue &&
                "This field is optional."}
            </FieldHelp>}
        </FormGroup>

        <FormGroup applyLabelOffset={index === 0} hasNarrowMargins={true}>
          <DeleteRowButton
            onClick={this.props.onRemoveItem.bind(this, {
              value: index,
              path: "constraints"
            })}
          />
        </FormGroup>
      </FormRow>
    );
  }
}

PlacementConstraintsField.propTypes = {
  constraint: PropTypes.shape({
    operator: PropTypes.string,
    fieldName: PropTypes.string
  }).isRequired,
  index: PropTypes.number.isRequired,
  hideValueColumn: PropTypes.bool.isRequired,
  isLastField: PropTypes.bool.isRequired,
  onRemoveItem: PropTypes.func.isRequired
};
