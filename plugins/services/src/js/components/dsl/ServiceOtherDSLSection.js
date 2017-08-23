/* @flow */
import React, { PropTypes } from "react";

import DSLCombinerTypes from "#SRC/js/constants/DSLCombinerTypes";
import DSLExpression from "#SRC/js/structs/DSLExpression";
import DSLExpressionPart from "#SRC/js/structs/DSLExpressionPart";
import DSLFormWithExpressionUpdates
  from "#SRC/js/components/DSLFormWithExpressionUpdates";
import DSLUtil from "#SRC/js/utils/DSLUtil";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";

const EXPRESSION_PARTS = {
  is_pod: DSLExpressionPart.attribute("is", "pod"),
  is_package: DSLExpressionPart.attribute("is", "package"),
  has_volumes: DSLExpressionPart.attribute("has", "volumes")
};

type Props = {
  onChange: Function,
  expression: DSLExpression,
};

class ServiceOtherDSLSection extends React.Component {

  render() {
    const { expression, onChange } = this.props;
    const enabled = DSLUtil.canProcessParts(expression, EXPRESSION_PARTS);
    const data = DSLUtil.getPartValues(expression, EXPRESSION_PARTS);

    return (
      <DSLFormWithExpressionUpdates
        enabled={enabled}
        expression={expression}
        groupCombiner={DSLCombinerTypes.AND}
        itemCombiner={DSLCombinerTypes.OR}
        onChange={onChange}
        parts={EXPRESSION_PARTS}
      >

        <label>Other</label>
        <div className="row">
          <div className="column-6">
            <FormGroup>
              <FieldLabel>
                <FieldInput
                  checked={data.is_package}
                  disabled={!enabled}
                  name="is_package"
                  type="checkbox"
                />
                Catalog
              </FieldLabel>
            </FormGroup>
            <FormGroup>
              <FieldLabel>
                <FieldInput
                  checked={data.is_pod}
                  disabled={!enabled}
                  name="is_pod"
                  type="checkbox"
                />
                Pod
              </FieldLabel>
            </FormGroup>
          </div>
          <div className="column-6">
            <FormGroup>
              <FieldLabel>
                <FieldInput
                  checked={data.has_volumes}
                  disabled={!enabled}
                  name="has_volumes"
                  type="checkbox"
                />
                Volumes
              </FieldLabel>
            </FormGroup>
          </div>
        </div>
      </DSLFormWithExpressionUpdates>
    );
  }
}

module.exports = ServiceOtherDSLSection;
