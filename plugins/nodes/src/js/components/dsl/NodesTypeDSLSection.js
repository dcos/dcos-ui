import PropTypes from "prop-types";
import React from "react";
import { Trans } from "@lingui/macro";

import {
  DSLCombinerTypes,
  DSLExpression,
  DSLExpressionPart,
  DSLUtil
} from "@d2iq/dsl-filter";

import DSLFormWithExpressionUpdates from "#SRC/js/components/DSLFormWithExpressionUpdates";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";

const EXPRESSION_PARTS = {
  is_private: DSLExpressionPart.attribute("is", "private"),
  is_public: DSLExpressionPart.attribute("is", "public")
};

class NodesTypeDSLSection extends React.Component {
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
        <Trans render="label">Type</Trans>
        <div className="row">
          <div className="column-12">
            <FormGroup>
              <FieldLabel>
                <FieldInput
                  checked={data.is_private}
                  disabled={!enabled}
                  name="is_private"
                  type="checkbox"
                />
                <Trans render="span">Private</Trans>
              </FieldLabel>
            </FormGroup>
          </div>
          <div className="column-12">
            <FormGroup>
              <FieldLabel>
                <FieldInput
                  checked={data.is_public}
                  disabled={!enabled}
                  name="is_public"
                  type="checkbox"
                />
                <Trans render="span">Public</Trans>
              </FieldLabel>
            </FormGroup>
          </div>
        </div>
      </DSLFormWithExpressionUpdates>
    );
  }
}

NodesTypeDSLSection.propTypes = {
  onChange: PropTypes.func.isRequired,
  expression: PropTypes.instanceOf(DSLExpression).isRequired
};

module.exports = NodesTypeDSLSection;
