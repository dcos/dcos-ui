import { i18nMark, withI18n } from "@lingui/react";
import { Trans } from "@lingui/macro";
import * as React from "react";
import PropTypes from "prop-types";
import { Tooltip, Select, SelectOption } from "reactjs-components";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import DeleteRowButton from "#SRC/js/components/form/DeleteRowButton";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";

import PlacementConstraintsUtil from "#PLUGINS/services/src/js/utils/PlacementConstraintsUtil";
import OperatorTypes from "#PLUGINS/services/src/js/constants/OperatorTypes";

// &nbsp; to space the table rows
const NBSP = "\u00A0";

class PlacementConstraintsFields extends React.Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    errors: PropTypes.object,
    onRemoveItem: PropTypes.func.isRequired,
  };
  getToolTip(fieldValue, content) {
    return (
      <Tooltip
        content={content}
        wrapperClassName="advanced-constraints"
        wrapText={true}
      >
        {fieldValue}
      </Tooltip>
    );
  }

  getPlacementConstraintLabel(name) {
    return (
      <FieldLabel>
        <FormGroupHeading>
          <Trans
            render={<FormGroupHeadingContent primary={true} />}
            id={name}
          />
        </FormGroupHeading>
      </FieldLabel>
    );
  }

  render() {
    const { props } = this;
    const { data = [], i18n } = props;
    const constraintsErrors = findNestedPropertyInObject(
      props.errors,
      "constraints"
    );

    const list = data.map((datum, arrayIndex) => {
      const { constraint, index } = datum;
      let fieldLabel = null;
      let operatorLabel = null;
      let valueLabel = null;
      const isFirstConstraint = arrayIndex === 0;

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
        fieldLabel = this.getPlacementConstraintLabel(i18nMark("Field"));
        operatorLabel = this.getPlacementConstraintLabel(i18nMark("Operator"));
        valueLabel = this.getPlacementConstraintLabel(i18nMark("Value"));
      }

      const fieldValue = (
        <FieldInput
          name={`constraints.${index}.value`}
          type="text"
          value={constraint.value}
          disabled={!!valueIsRequiredEmpty}
        />
      );

      const isLastField = arrayIndex === data.length - 1;
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
              {Object.keys(OperatorTypes).map((type, index) => (
                <SelectOption
                  key={index}
                  value={type}
                  label={i18n._(OperatorTypes[type].name)}
                >
                  <Trans
                    render="span"
                    className="dropdown-select-item-title"
                    id={OperatorTypes[type].name}
                  />
                  <Trans
                    render="span"
                    className="dropdown-select-item-description"
                    id={OperatorTypes[type].description}
                  />
                </SelectOption>
              ))}
            </Select>

            {operatorError && <FieldError>{operatorError}</FieldError>}
            {!operatorError && (
              <FieldHelp>
                {isLastField ? (
                  <Trans render="span">Specify where your app will run.</Trans>
                ) : (
                  NBSP
                )}
              </FieldHelp>
            )}
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
              value={constraint.fieldName}
            />

            {fieldNameError && <FieldError>{fieldNameError}</FieldError>}
            {!fieldNameError && (
              <FieldHelp>{isLastField ? "E.g hostname." : NBSP}</FieldHelp>
            )}
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

            {valueError && <FieldError>{valueError}</FieldError>}
            {!valueError && (
              <FieldHelp>
                {isLastField ? "A string, integer or regex value. " : NBSP}
                {typeSettings &&
                  !typeSettings.requiresValue &&
                  !typeSettings.requiresEmptyValue &&
                  "This field is optional."}
              </FieldHelp>
            )}
          </FormGroup>

          <FormGroup
            applyLabelOffset={isFirstConstraint}
            hasNarrowMargins={true}
          >
            <DeleteRowButton
              onClick={props.onRemoveItem.bind(this, {
                value: index,
                path: "constraints",
              })}
            />
          </FormGroup>
        </FormRow>
      );
    });

    return <div>{list}</div>;
  }
}

export default withI18n()(PlacementConstraintsFields);
