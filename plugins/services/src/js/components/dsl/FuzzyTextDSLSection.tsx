import { Trans, t } from "@lingui/macro";
import { withI18n } from "@lingui/react";
import PropTypes from "prop-types";
import * as React from "react";

import DSLCombinerTypes from "#SRC/js/constants/DSLCombinerTypes";
import DSLExpression from "#SRC/js/structs/DSLExpression";
import DSLExpressionPart from "#SRC/js/structs/DSLExpressionPart";
import DSLFormWithExpressionUpdates from "#SRC/js/components/DSLFormWithExpressionUpdates";
import DSLUtil from "#SRC/js/utils/DSLUtil";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";

import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";
import { FilterNode } from "#SRC/js/structs/DSLASTNodes";
import DSLUpdateUtil from "#SRC/js/utils/DSLUpdateUtil";

const EXPRESSION_PARTS = {
  text: DSLExpressionPart.fuzzy,
};

class FuzzyTextDSLSection extends React.Component {
  static propTypes = {
    onApply: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    expression: PropTypes.instanceOf(DSLExpression).isRequired,
  };

  state = { data: { text: "" } };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { expression } = nextProps;
    const data = DSLUtil.getPartValues(expression, EXPRESSION_PARTS);

    this.setState({ data });
  }
  handleTextChange = (event) => {
    const { onChange, expression } = this.props;
    const { target } = event;
    event.stopPropagation();

    const value = target.value;
    this.setState({
      data: {
        ...this.state.data,
        text: value,
      },
    });

    // TODO: find better abstraction here (DCOS-40235)
    const newFuzzyNodes = value
      .replace(":", " ")
      .split(" ")
      .map((text) => new FilterNode(0, 0, DSLFilterTypes.FUZZY, { text }));

    const updateNode = EXPRESSION_PARTS.text;
    // The node(s) relevant to the property we are updating
    const matchingNodes = DSLUtil.findNodesByFilter(expression.ast, updateNode);

    // And replace the existing fuzzy nodes
    const newExpression = DSLUpdateUtil.applyReplace(
      expression,
      matchingNodes,
      newFuzzyNodes,
      {
        newCombiner: DSLCombinerTypes.AND,
      }
    );

    onChange(newExpression);
  };

  render() {
    const { data } = this.state;
    const { expression, onApply, onChange, i18n } = this.props;
    const enabled = DSLUtil.canProcessParts(expression, EXPRESSION_PARTS);

    return (
      <DSLFormWithExpressionUpdates
        expression={expression}
        groupCombiner={DSLCombinerTypes.AND}
        itemCombiner={DSLCombinerTypes.OR}
        onChange={onChange}
        onSubmit={onApply}
        parts={EXPRESSION_PARTS}
      >
        <FormGroup>
          <FieldLabel>
            <Trans render="span">Has the words</Trans>
          </FieldLabel>
          <FieldInput
            disabled={!enabled}
            name="text"
            onChange={this.handleTextChange}
            placeholder={i18n._(t`Enter words found in name`)}
            value={data.text || ""}
          />
        </FormGroup>
      </DSLFormWithExpressionUpdates>
    );
  }
}

export default withI18n()(FuzzyTextDSLSection);
