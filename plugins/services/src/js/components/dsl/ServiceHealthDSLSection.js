import React, {PropTypes} from 'react';
import DSLCombinerTypes from '../../../../../../src/js/constants/DSLCombinerTypes';
import DSLExpression from '../../../../../../src/js/structs/DSLExpression';
import DSLExpressionPart from '../../../../../../src/js/structs/DSLExpressionPart';
import DSLFormWithExpressionUpdates from '../../../../../../src/js/components/DSLFormWithExpressionUpdates';
import DSLUtil from '../../../../../../src/js/utils/DSLUtil';

const PARTS = {
  is_healthy   : DSLExpressionPart.attrib('health', 'healthy'),
  is_unhealthy : DSLExpressionPart.attrib('health', 'unhealthy'),
  is_idle      : DSLExpressionPart.attrib('health', 'idle'),
  is_na        : DSLExpressionPart.attrib('health', 'na')
};

class ServiceHealthDSLSection extends React.Component {
  render() {
    const {expression, onChange} = this.props;
    const enabled = DSLUtil.canProcessParts(expression, PARTS);
    const data = DSLUtil.getPartValues(expression, PARTS);

    return (
      <DSLFormWithExpressionUpdates
        expression={expression}
        groupCombiner={DSLCombinerTypes.AND}
        itemCombiner={DSLCombinerTypes.OR}
        onChange={onChange}
        parts={PARTS} >

        <h5>HEALTH</h5>
        <div className="row">
          <div className="column-6">
            <div className="form-group">
              <label className="form-control-toggle">
                <input
                  checked={data.is_healthy}
                  disabled={!enabled}
                  name="is_healthy"
                  type="checkbox" />
                Healthy
              </label>
              <label className="form-control-toggle">
                <input
                  checked={data.is_idle}
                  disabled={!enabled}
                  name="is_idle"
                  type="checkbox" />
                Idle
              </label>
            </div>
          </div>
          <div className="column-6">
            <div className="form-group">
              <label className="form-control-toggle">
                <input
                  checked={data.is_unhealthy}
                  disabled={!enabled}
                  name="is_unhealthy"
                  type="checkbox" />
                Unhealthy
              </label>
              <label className="form-control-toggle">
                <input
                  checked={data.is_na}
                  disabled={!enabled}
                  name="is_na"
                  type="checkbox" />
                N/A
              </label>
            </div>
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
