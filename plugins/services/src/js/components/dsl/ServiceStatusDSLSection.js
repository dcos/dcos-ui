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
  is_running: DSLExpressionPart.attribute("is", "running"),
  is_deploying: DSLExpressionPart.attribute("is", "deploying"),
  is_suspended: DSLExpressionPart.attribute("is", "suspended"),
  is_delayed: DSLExpressionPart.attribute("is", "delayed"),
  is_waiting: DSLExpressionPart.attribute("is", "waiting")
};

class ServiceStatusDSLSection extends React.Component {
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

        <label>Status</label>
        <div className="row">
          <div className="column-6">
            <FormGroup>
              <FieldLabel>
                <FieldInput
                  checked={data.is_running}
                  disabled={!enabled}
                  name="is_running"
                  type="checkbox"
                />
                Running
              </FieldLabel>
              <FieldLabel>
                <FieldInput
                  checked={data.is_deploying}
                  disabled={!enabled}
                  name="is_deploying"
                  type="checkbox"
                />
                Deploying
              </FieldLabel>
              <FieldLabel>
                <FieldInput
                  checked={data.is_suspended}
                  disabled={!enabled}
                  name="is_suspended"
                  type="checkbox"
                />
                Suspended
              </FieldLabel>
            </FormGroup>
          </div>
          <div className="column-6">
            <FormGroup>
              <FieldLabel>
                <FieldInput
                  checked={data.is_delayed}
                  disabled={!enabled}
                  name="is_delayed"
                  type="checkbox"
                />
                Delayed
              </FieldLabel>
              <FieldLabel>
                <FieldInput
                  checked={data.is_waiting}
                  disabled={!enabled}
                  name="is_waiting"
                  type="checkbox"
                />
                Waiting
              </FieldLabel>
            </FormGroup>
          </div>
        </div>
      </DSLFormWithExpressionUpdates>
    );
  }
}

ServiceStatusDSLSection.propTypes = {
  onChange: PropTypes.func.isRequired,
  expression: PropTypes.instanceOf(DSLExpression).isRequired
};

module.exports = ServiceStatusDSLSection;
