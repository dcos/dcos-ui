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

const EXPRESSION_PARTS = {
  is_healthy: DSLExpressionPart.attribute("is", "healthy"),
  is_unhealthy: DSLExpressionPart.attribute("is", "unhealthy"),
  no_healthchecks: DSLExpressionPart.attribute("no", "healthchecks")
};

class ServiceHealthDSLSection extends React.Component {
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
        <Trans render="label">Health</Trans>
        <div className="row">
          <div className="column-6">
            <FormGroup>
              <FieldLabel>
                <FieldInput
                  checked={data.is_healthy}
                  disabled={!enabled}
                  name="is_healthy"
                  type="checkbox"
                />
                <Trans render="span">Healthy</Trans>
              </FieldLabel>
              <FieldLabel>
                <FieldInput
                  checked={data.no_healthchecks}
                  disabled={!enabled}
                  name="no_healthchecks"
                  type="checkbox"
                />
                <Trans render="span">N/A</Trans>
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
                  type="checkbox"
                />
                <Trans render="span">Unhealthy</Trans>
              </FieldLabel>
            </FormGroup>
          </div>
        </div>
      </DSLFormWithExpressionUpdates>
    );
  }
}

ServiceHealthDSLSection.propTypes = {
  onChange: PropTypes.func.isRequired,
  expression: PropTypes.instanceOf(DSLExpression).isRequired
};

module.exports = ServiceHealthDSLSection;
