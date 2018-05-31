import PropTypes from "prop-types";
import React from "react";

import DSLCombinerTypes from "#SRC/js/constants/DSLCombinerTypes";
import DSLExpression from "#SRC/js/structs/DSLExpression";
import DSLExpressionPart from "#SRC/js/structs/DSLExpressionPart";
import DSLFormWithExpressionUpdates from "#SRC/js/components/DSLFormWithExpressionUpdates";
import DSLUtil from "#SRC/js/utils/DSLUtil";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";

const EXPRESSION_PARTS = {
  is_active: DSLExpressionPart.attribute("is", "active"),
  is_completed: DSLExpressionPart.attribute("is", "completed")
};

class TasksStatusDSLSection extends React.Component {
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
                  checked={data.is_active}
                  disabled={!enabled}
                  name="is_active"
                  type="checkbox"
                />
                Active
              </FieldLabel>
              <FieldLabel>
                <FieldInput
                  checked={data.is_completed}
                  disabled={!enabled}
                  name="is_completed"
                  type="checkbox"
                />
                Completed
              </FieldLabel>
            </FormGroup>
          </div>
        </div>
      </DSLFormWithExpressionUpdates>
    );
  }
}

TasksStatusDSLSection.defaultProps = {
  expression: new DSLExpression(""),
  onChange() {}
};

TasksStatusDSLSection.propTypes = {
  expression: PropTypes.instanceOf(DSLExpression).isRequired,
  onChange: PropTypes.func.isRequired
};

module.exports = TasksStatusDSLSection;
