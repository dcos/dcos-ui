import PropTypes from "prop-types";
import React from "react";
import { Trans } from "@lingui/macro";

import DSLCombinerTypes from "#SRC/js/constants/DSLCombinerTypes";
import DSLExpression from "#SRC/js/structs/DSLExpression";
import DSLExpressionPart from "#SRC/js/structs/DSLExpressionPart";
import DSLFormWithExpressionUpdates from "#SRC/js/components/DSLFormWithExpressionUpdates";
import DSLUtil from "#SRC/js/utils/DSLUtil";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";

const EXPRESSION_PARTS = {};

class NodeRegionDSLSection extends React.Component {
  render() {
    const {
      expression,
      onChange,
      defaultData: { regions }
    } = this.props;

    if (!regions || regions.length === 0) {
      return null;
    }

    regions.forEach(function(region) {
      EXPRESSION_PARTS[`region_${region}`] = DSLExpressionPart.attribute(
        "region",
        region
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
        <Trans render="label">Regions</Trans>
        <div className="row">
          <div className="column-12">
            {regions.map(region => {
              const regionName = `region_${region}`;

              return (
                <FormGroup key={regionName}>
                  <FieldLabel>
                    <FieldInput
                      checked={data[regionName]}
                      disabled={!enabled}
                      name={regionName}
                      type="checkbox"
                    />
                    {region}
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

NodeRegionDSLSection.defaultProps = {
  onChange() {},
  expression: new DSLExpression(""),
  defaultData: { regions: [] }
};

NodeRegionDSLSection.propTypes = {
  onChange: PropTypes.func.isRequired,
  expression: PropTypes.instanceOf(DSLExpression).isRequired,
  defaultData: PropTypes.object.isRequired
};

export default NodeRegionDSLSection;
