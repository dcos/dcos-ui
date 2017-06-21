import React, { PropTypes } from "react";

import DSLCombinerTypes
  from "../../../../../../src/js/constants/DSLCombinerTypes";
import DSLExpression from "../../../../../../src/js/structs/DSLExpression";
import DSLExpressionPart
  from "../../../../../../src/js/structs/DSLExpressionPart";
import DSLFormWithExpressionUpdates
  from "../../../../../../src/js/components/DSLFormWithExpressionUpdates";
import DSLUtil from "../../../../../../src/js/utils/DSLUtil";
import FieldInput from "../../../../../../src/js/components/form/FieldInput";
import FieldLabel from "../../../../../../src/js/components/form/FieldLabel";
import FormGroup from "../../../../../../src/js/components/form/FormGroup";

const EXPRESSION_PARTS = {
  is_pod: DSLExpressionPart.attribute("is", "pod"),
  is_universe: DSLExpressionPart.attribute("is", "universe"),
  has_volumes: DSLExpressionPart.attribute("has", "volumes")
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
                  checked={data.is_universe}
                  disabled={!enabled}
                  name="is_universe"
                  type="checkbox"
                />
                Universe
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

ServiceOtherDSLSection.propTypes = {
  onChange: PropTypes.func.isRequired,
  expression: PropTypes.instanceOf(DSLExpression).isRequired
};

module.exports = ServiceOtherDSLSection;
