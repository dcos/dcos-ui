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
  is_running: DSLExpressionPart.attribute("is", "running"),
  is_deploying: DSLExpressionPart.attribute("is", "deploying"),
  is_suspended: DSLExpressionPart.attribute("is", "suspended"),
  is_delayed: DSLExpressionPart.attribute("is", "delayed"),
  is_waiting: DSLExpressionPart.attribute("is", "waiting")
};

type Props = {
  onChange: Function,
  expression: DSLExpression,
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

module.exports = ServiceStatusDSLSection;
