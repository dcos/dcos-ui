import React, {PropTypes} from 'react';
import DSLExpression from '../../../../../../src/js/structs/DSLExpression';
import DSLExpressionPart from '../../../../../../src/js/structs/DSLExpressionPart';
import DSLFormWithExpressionUpdates from '../../../../../../src/js/components/DSLFormWithExpressionUpdates';
import DSLUpdatePolicy from '../../../../../../src/js/constants/DSLUpdatePolicy';
import DSLUtil from '../../../../../../src/js/utils/DSLUtil';

const PARTS = {
  is_running   : DSLExpressionPart.attrib('is', 'running'),
  is_deploying : DSLExpressionPart.attrib('is', 'deploying'),
  is_suspended : DSLExpressionPart.attrib('is', 'suspended'),
  is_delayed   : DSLExpressionPart.attrib('is', 'delayed'),
  is_waiting   : DSLExpressionPart.attrib('is', 'waiting')
};

class ServiceStatusDSLSection extends React.Component {
  render() {
    const {expression, onChange} = this.props;
    const enabled = DSLUtil.canProcessParts(expression, PARTS);
    const data = DSLUtil.getPartValues(expression, PARTS);

    return (
      <DSLFormWithExpressionUpdates
        expression={expression}
        parts={PARTS}
        onChange={onChange}
        updatePolicy={DSLUpdatePolicy.Checkbox}>

        <h5>STATUS</h5>
        <div className="row">
          <div className="column-6">
            <div className="form-group">
              <label className="form-control-toggle">
                <input
                  checked={data.is_running}
                  disabled={!enabled}
                  name="is_running"
                  type="checkbox" />
                Running
              </label>
              <label className="form-control-toggle">
                <input
                  checked={data.is_deploying}
                  disabled={!enabled}
                  name="is_deploying"
                  type="checkbox" />
                Deploying
              </label>
              <label className="form-control-toggle">
                <input
                  checked={data.is_suspended}
                  disabled={!enabled}
                  name="is_suspended"
                  type="checkbox" />
                Suspended
              </label>
            </div>
          </div>
          <div className="column-6">
            <div className="form-group">
              <label className="form-control-toggle">
                <input
                  checked={data.is_delayed}
                  disabled={!enabled}
                  name="is_delayed"
                  type="checkbox" />
                Delayed
              </label>
              <label className="form-control-toggle">
                <input
                  checked={data.is_waiting}
                  disabled={!enabled}
                  name="is_waiting"
                  type="checkbox" />
                Waiting
              </label>
            </div>
          </div>
        </div>
      </DSLFormWithExpressionUpdates>
    );
  }
};

ServiceStatusDSLSection.propTypes = {
  onChange: PropTypes.func.isRequired,
  expression: PropTypes.instanceOf(DSLExpression).isRequired
};

module.exports = ServiceStatusDSLSection;
