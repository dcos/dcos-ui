import * as React from "react";
import { Trans } from "@lingui/macro";

import DSLCombinerTypes from "#SRC/js/constants/DSLCombinerTypes";
import DSLExpressionPart from "#SRC/js/structs/DSLExpressionPart";
import DSLFormWithExpressionUpdates from "#SRC/js/components/DSLFormWithExpressionUpdates";
import DSLUtil from "#SRC/js/utils/DSLUtil";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import { Status } from "../../types/Status";

const EXPRESSION_PARTS = Object.keys(Status.filters).reduce(
  (acc: Record<string, unknown>, key) => {
    acc[key] = DSLExpressionPart.attribute("status", key);
    return acc;
  },
  {}
);

export default class NodesStatusDSLSection extends React.PureComponent<{
  expression: string;
  onChange: () => void;
}> {
  public render() {
    const { expression, onChange } = this.props;

    const enabled = DSLUtil.canProcessParts(expression, EXPRESSION_PARTS);

    const data = DSLUtil.getPartValues(expression, EXPRESSION_PARTS);

    return (
      <DSLFormWithExpressionUpdates
        enabled={enabled}
        expression={expression}
        itemCombiner={DSLCombinerTypes.OR}
        onChange={onChange}
        parts={EXPRESSION_PARTS}
      >
        <Trans render="label">Status</Trans>
        <div className="row">
          {Object.entries(Status.filters).map(([key, status]) =>
            checkbox({
              checked: data[key],
              disabled: !enabled,
              label: status.displayName,
              name: key
            })
          )}
        </div>
      </DSLFormWithExpressionUpdates>
    );
  }
}

const checkbox = (o: {
  checked: boolean;
  disabled: boolean;
  name: string;
  label: string;
}) => (
  <div className="column-12" key={o.name}>
    <FormGroup>
      <FieldLabel>
        <FieldInput
          checked={o.checked}
          disabled={o.disabled}
          name={o.name}
          type="checkbox"
        />
        <Trans render="span">{o.label}</Trans>
      </FieldLabel>
    </FormGroup>
  </div>
);
