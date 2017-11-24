import React, { Component } from "react";
import { Tooltip } from "reactjs-components";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import AddButton from "#SRC/js/components/form/AddButton";
import DeleteRowButton from "#SRC/js/components/form/DeleteRowButton";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
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
import Icon from "#SRC/js/components/Icon";

import OperatorTypes from "#PLUGINS/services/src/js/constants/OperatorTypes";
import PlacementConstraintsUtil
  from "#PLUGINS/services/src/js/utils/PlacementConstraintsUtil";

function placementConstraintLabel(name, tooltipText, options = {}) {
  const { isRequired = false, linkText = "More information" } = options;

  const tooltipContent = (
    <span>
      {`${tooltipText} `}
      <a
        href="https://mesosphere.github.io/marathon/docs/constraints.html"
        target="_blank"
      >
        {linkText}
      </a>.
    </span>
  );

  return (
    <FieldLabel>
      <FormGroupHeading required={isRequired}>
        <FormGroupHeadingContent primary={true}>
          {name}
        </FormGroupHeadingContent>
        <FormGroupHeadingContent>
          <Tooltip
            content={tooltipContent}
            interactive={true}
            maxWidth={300}
            wrapText={true}
          >
            <Icon color="grey" id="circle-question" size="mini" />
          </Tooltip>
        </FormGroupHeadingContent>
      </FormGroupHeading>
    </FieldLabel>
  );
}

export default class PlacementSection extends Component {
  getOperatorTypes() {
    return Object.keys(OperatorTypes).map((type, index) => {
      return <option key={index} value={type}>{type}</option>;
    });
  }

  getPlacementConstraintsFields(data = []) {
    const constraintsErrors = findNestedPropertyInObject(
      this.props.errors,
      "constraints"
    );
    const hasOneRequiredValue = data.some(function(constraint) {
      return PlacementConstraintsUtil.requiresValue(constraint.operator);
    });
    const hideValueColumn = data.every(function(constraint) {
      return PlacementConstraintsUtil.requiresEmptyValue(constraint.operator);
    });

    return data.map((constraint, index) => {
      let fieldLabel = null;
      let operatorLabel = null;
      let valueLabel = null;
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
      const commonFieldsClassNames = {
        "column-4": !hideValueColumn,
        "column-6": hideValueColumn
      };

      if (index === 0) {
        fieldLabel = placementConstraintLabel(
          "Field",
          "If you enter `hostname`, the constraint will map to the agent node hostname. If you do not enter an agent node hostname, the field will be treated as a Mesos agent node attribute, which allows you to tag an agent node.",
          { isRequired: true }
        );
        operatorLabel = placementConstraintLabel(
          "Operator",
          "Operators specify where your app will run.",
          { isRequired: true }
        );
      }
      if (index === 0 && !hideValueColumn) {
        valueLabel = placementConstraintLabel(
          "Value",
          "Values allow you to further specify your constraint.",
          { linkText: "Learn more", isRequired: hasOneRequiredValue }
        );
      }

      return (
        <FormRow key={index}>
          <FormGroup
            className={commonFieldsClassNames}
            required={true}
            showError={Boolean(fieldNameError)}
          >
            {fieldLabel}
            <FieldAutofocus>
              <FieldInput
                name={`constraints.${index}.fieldName`}
                type="text"
                placeholder="hostname"
                value={constraint.fieldName}
              />
            </FieldAutofocus>
            <FieldError>{fieldNameError}</FieldError>
          </FormGroup>
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
              {this.getOperatorTypes()}
            </FieldSelect>
            <FieldError>{operatorError}</FieldError>
          </FormGroup>
          <FormGroup
            className={{
              "column-4": !hideValueColumn,
              hidden: hideValueColumn
            }}
            required={valueIsRequired}
            showError={Boolean(valueError)}
          >
            {valueLabel}
            <FieldInput
              className={{ hidden: valueIsRequiredEmpty }}
              name={`constraints.${index}.value`}
              type="text"
              value={constraint.value}
            />
            <FieldHelp
              className={{ hidden: valueIsRequired || valueIsRequiredEmpty }}
            >
              This field is optional
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
