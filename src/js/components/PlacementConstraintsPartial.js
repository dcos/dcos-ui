import React, { Component } from "react";
import { Tooltip } from "reactjs-components";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import AddButton from "#SRC/js/components/form/AddButton";
import DeleteRowButton from "#SRC/js/components/form/DeleteRowButton";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FieldSelect from "#SRC/js/components/form/FieldSelect";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent
  from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";

import OperatorTypes from "#PLUGINS/services/src/js/constants/OperatorTypes";
import PlacementConstraintsUtil
  from "#PLUGINS/services/src/js/utils/PlacementConstraintsUtil";

export default class PlacementConstraintsPartial extends Component {
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

  getToolTip(fieldValue, content) {
    return (
      <Tooltip content={content} wrapperClassName="advanced-constraints">
        {fieldValue}
      </Tooltip>
    );
  }

  getPlacementConstraintsFields(data = []) {
    const constraintsErrors = findNestedPropertyInObject(
      this.props.errors,
      "constraints"
    );
    const hideValueColumn = data.every(function(constraint) {
      return PlacementConstraintsUtil.requiresEmptyValue(constraint.operator);
    });

    return data.map((constraint, index) => {
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

      return (
        <FormRow key={index}>
          <FormGroup
            className={commonFieldsClassNames}
            required={true}
            showError={Boolean(operatorError)}
          >
            {operatorLabel}
            <FieldSelect
              name={`constraints.${index}.operator`}
              type="text"
              value={String(constraint.operator)}
            >
              <option value="">Select</option>
              {Object.keys(OperatorTypes).map((type, index) => {
                return (
                  <option key={index} value={type}>
                    {type}
                  </option>
                );
              })}
            </FieldSelect>
            <FieldHelp>
              Specify where your app will run.
            </FieldHelp>
            <FieldError>{operatorError}</FieldError>
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
            <FieldHelp>
              E.g hostname.
            </FieldHelp>
            <FieldError>{fieldNameError}</FieldError>
          </FormGroup>
          <FormGroup
            className={commonFieldsClassNames}
            required={valueIsRequired}
            showError={Boolean(valueError)}
          >
            {valueLabel}
            {valueIsRequiredEmpty
              ? this.getToolTip(
                  fieldValue,
                  OperatorTypes[constraint.operator].tooltipContent
                )
              : fieldValue}
            <FieldHelp>
              {OperatorTypes[constraint.operator]
                ? OperatorTypes[constraint.operator].helpContent
                : "A string, integer or regex value."}
            </FieldHelp>
            <FieldError className={{ hidden: hideValueColumn }}>
              {valueError}
            </FieldError>
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
    });
  }

  render() {
    const { data = {} } = this.props;
    const constraintsErrors = findNestedPropertyInObject(
      this.props.errors,
      "constraints"
    );
    let errorNode = null;
    const hasErrors =
      constraintsErrors != null && !Array.isArray(constraintsErrors);

    if (hasErrors) {
      errorNode = (
        <FormGroup showError={hasErrors}>
          <FieldError>
            {constraintsErrors}
          </FieldError>
        </FormGroup>
      );
    }

    return (
      <div>
        {this.getPlacementConstraintsFields(data.constraints)}
        {errorNode}
        <FormRow>
          <FormGroup className="column-12">
            <AddButton
              onClick={this.props.onAddItem.bind(this, {
                path: "constraints",
                value: { type: "default" }
              })}
            >
              Add Placement Constraint
            </AddButton>
          </FormGroup>
        </FormRow>
      </div>
    );
  }
}
