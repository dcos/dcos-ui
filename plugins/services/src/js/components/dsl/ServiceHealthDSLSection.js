import React, {PropTypes} from 'react';

import DSLCombinerTypes from '../../../../../../src/js/constants/DSLCombinerTypes';
import DSLExpression from '../../../../../../src/js/structs/DSLExpression';
import DSLExpressionPart from '../../../../../../src/js/structs/DSLExpressionPart';
import DSLFormWithExpressionUpdates from '../../../../../../src/js/components/DSLFormWithExpressionUpdates';
import DSLUtil from '../../../../../../src/js/utils/DSLUtil';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';

const EXPRESSION_PARTS = {
  is_healthy: DSLExpressionPart.attrib('health', 'healthy'),
  is_unhealthy: DSLExpressionPart.attrib('health', 'unhealthy'),
  is_idle: DSLExpressionPart.attrib('health', 'idle'),
  is_na: DSLExpressionPart.attrib('health', 'na')
};

class ServiceHealthDSLSection extends React.Component {
  render() {
    const {expression, onChange} = this.props;
    const enabled = DSLUtil.canProcessParts(expression, EXPRESSION_PARTS);
    const data = DSLUtil.getPartValues(expression, EXPRESSION_PARTS);

    return (
      <DSLFormWithExpressionUpdates
        expression={expression}
        groupCombiner={DSLCombinerTypes.AND}
        itemCombiner={DSLCombinerTypes.OR}
        onChange={onChange}
        parts={EXPRESSION_PARTS}>

        <label>Health</label>
        <div className="row">
          <div className="column-6">
            <FormGroup>
              <FieldLabel>
                <FieldInput
                  checked={data.is_healthy}
                  disabled={!enabled}
                  name="is_healthy"
                  type="checkbox" />
                Healthy
              </FieldLabel>
              <FieldLabel>
                <FieldInput
                  checked={data.is_idle}
                  disabled={!enabled}
                  name="is_idle"
                  type="checkbox" />
                Idle
              </FieldLabel>
            </FormGroup>
          </div>
          <div className="column-6">
            <FormGroup>
              <FieldLabel>
                <FieldInput
                  checked={data.is_unhealthy}
                  disabled={!enabled}
                  name="is_unhealthy"
                  type="checkbox" />
                Unhealthy
              </FieldLabel>
              <FieldLabel>
                <FieldInput
                  checked={data.is_na}
                  disabled={!enabled}
                  name="is_na"
                  type="checkbox" />
                N/A
              </FieldLabel>
            </FormGroup>
          </div>
        </div>
      </DSLFormWithExpressionUpdates>
    );
  }
};

ServiceHealthDSLSection.propTypes = {
  onChange: PropTypes.func.isRequired,
  expression: PropTypes.instanceOf(DSLExpression).isRequired
};

module.exports = ServiceHealthDSLSection;
