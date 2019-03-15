import { Trans } from "@lingui/macro";
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

const EXPRESSION_PARTS = {};

class TaskZoneDSLSection extends React.Component {
  render() {
    const {
      expression,
      onChange,
      defaultData: { zones }
    } = this.props;

    if (!zones || zones.length === 0) {
      return null;
    }

    zones.forEach(function(zone) {
      EXPRESSION_PARTS[`zone_${zone}`] = DSLExpressionPart.attribute(
        "zone",
        zone
      );
    }, this);

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
        <Trans render="label">Zones</Trans>
        <div className="row">
          <div className="column-12">
            {zones.map(zone => {
              const zoneName = `zone_${zone}`;

              return (
                <FormGroup key={zoneName}>
                  <FieldLabel>
                    <FieldInput
                      checked={data[zoneName]}
                      disabled={!enabled}
                      name={zoneName}
                      type="checkbox"
                    />
                    {zone}
                  </FieldLabel>
                </FormGroup>
              );
            })}
          </div>
        </div>
      </DSLFormWithExpressionUpdates>
    );
  }
}

TaskZoneDSLSection.defaultProps = {
  expression: new DSLExpression(""),
  onChange() {},
  defaultData: { zones: [] }
};

TaskZoneDSLSection.propTypes = {
  expression: PropTypes.instanceOf(DSLExpression).isRequired,
  onChange: PropTypes.func.isRequired,
  defaultData: PropTypes.object.isRequired
};

export default TaskZoneDSLSection;
