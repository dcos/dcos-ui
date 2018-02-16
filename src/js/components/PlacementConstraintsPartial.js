import React, { Component } from "react";
import { Tooltip } from "reactjs-components";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import AddButton from "#SRC/js/components/form/AddButton";
import FieldError from "#SRC/js/components/form/FieldError";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormRow from "#SRC/js/components/form/FormRow";

import PlacementConstraintsUtil
  from "#PLUGINS/services/src/js/utils/PlacementConstraintsUtil";
import PlacementConstraintsField
  from "#SRC/js/components/PlacementConstraintsField";

export default class PlacementConstraintsPartial extends Component {
  getToolTip(fieldValue, content) {
    return (
      <Tooltip content={content} wrapperClassName="advanced-constraints">
        {fieldValue}
      </Tooltip>
    );
  }

  getPlacementConstraintsFields(data = []) {
    const hideValueColumn = data.every(function(constraint) {
      return PlacementConstraintsUtil.requiresEmptyValue(constraint.operator);
    });

    return data.map((constraint, index) => {
      const isLastField = index === data.length - 1;

      return (
        <PlacementConstraintsField
          constraint={constraint}
          index={index}
          hideValueColumn={hideValueColumn}
          isLastField={isLastField}
          errors={this.props.errors}
        />
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
