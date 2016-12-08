import React, {PropTypes} from 'react';
import DSLCombinerTypes from '../../../../../../src/js/constants/DSLCombinerTypes';
import DSLExpression from '../../../../../../src/js/structs/DSLExpression';
import DSLExpressionPart from '../../../../../../src/js/structs/DSLExpressionPart';
import DSLFormWithExpressionUpdates from '../../../../../../src/js/components/DSLFormWithExpressionUpdates';
import DSLUtil from '../../../../../../src/js/utils/DSLUtil';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';

const PARTS = {
  text: DSLExpressionPart.fuzzy
};

class FuzzyTextDSLSection extends React.Component {
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

        <FormGroup>
          <FieldLabel>Has the words</FieldLabel>
          <FieldInput
            value={data.text}
            disabled={!enabled}
            name="text"
            placeholder="Enter words found in name" />
        </FormGroup>

      </DSLFormWithExpressionUpdates>
    );
  }
};

FuzzyTextDSLSection.propTypes = {
  onChange: PropTypes.func.isRequired,
  expression: PropTypes.instanceOf(DSLExpression).isRequired
};

module.exports = FuzzyTextDSLSection;
