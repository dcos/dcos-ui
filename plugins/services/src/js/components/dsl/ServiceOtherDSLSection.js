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
  is_pod: DSLExpressionPart.attribute("is", "pod"),
  is_catalog: DSLExpressionPart.attribute("is", "catalog"),
  has_volumes: DSLExpressionPart.attribute("has", "volumes")
};

class ServiceOtherDSLSection extends React.Component {
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
        <Trans render="label">Other</Trans>
        <div className="row">
          <div className="column-6">
            <FormGroup>
              <FieldLabel>
                <FieldInput
                  checked={data.is_catalog}
                  disabled={!enabled}
                  name="is_catalog"
                  type="checkbox"
                />
                <Trans render="span">Catalog</Trans>
              </FieldLabel>
              <FieldLabel>
                <FieldInput
                  checked={data.is_pod}
                  disabled={!enabled}
                  name="is_pod"
                  type="checkbox"
                />
                <Trans render="span">Pod</Trans>
              </FieldLabel>
            </FormGroup>
          </div>
          <div className="column-6">
            <FormGroup>
              <FieldLabel>
                <FieldInput
                  checked={data.has_volumes}
                  disabled={!enabled}
                  name="has_volumes"
                  type="checkbox"
                />
                <Trans render="span">Volumes</Trans>
              </FieldLabel>
            </FormGroup>
          </div>
        </div>
      </DSLFormWithExpressionUpdates>
    );
  }
}

ServiceOtherDSLSection.propTypes = {
  onChange: PropTypes.func.isRequired,
  expression: PropTypes.instanceOf(DSLExpression).isRequired
};

export default ServiceOtherDSLSection;
