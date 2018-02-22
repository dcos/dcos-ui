import PropTypes from "prop-types";
import React from "react";

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
  is_deleting: DSLExpressionPart.attribute("is", "deleting"),
  is_deploying: DSLExpressionPart.attribute("is", "deploying"),
  is_recovering: DSLExpressionPart.attribute("is", "recovering"),
  is_running: DSLExpressionPart.attribute("is", "running"),
  is_stopped: DSLExpressionPart.attribute("is", "stopped")
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
                  checked={data.is_recovering}
                  disabled={!enabled}
                  name="is_recovering"
                  type="checkbox"
                />
                Recovering
              </FieldLabel>
            </FormGroup>
          </div>
          <div className="column-6">
            <FormGroup>
              <FieldLabel>
                <FieldInput
                  checked={data.is_stopped}
                  disabled={!enabled}
                  name="is_stopped"
                  type="checkbox"
                />
                Stopped
              </FieldLabel>
              <FieldLabel>
                <FieldInput
                  checked={data.is_deleting}
                  disabled={!enabled}
                  name="is_deleting"
                  type="checkbox"
                />
                Deleting
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
