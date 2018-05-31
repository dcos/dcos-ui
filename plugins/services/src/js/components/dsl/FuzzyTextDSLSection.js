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
  text: DSLExpressionPart.fuzzy
};

const METHODS_TO_BIND = ["handleTextChange"];

class FuzzyTextDSLSection extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      data: {
        text: ""
      }
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps(nextProps) {
    const { expression } = nextProps;
    const data = DSLUtil.getPartValues(expression, EXPRESSION_PARTS);

    this.setState({ data });
  }

  handleTextChange(event) {
    const { target } = event;
    event.stopPropagation();
    this.setState({
      data: Object.assign({}, this.state.data, {
        text: target.value
      })
    });
  }

  render() {
    const { data } = this.state;
    const { expression, onApply, onChange } = this.props;
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
          <FieldLabel>Has the words</FieldLabel>
          <FieldInput
            disabled={!enabled}
            name="text"
            onChange={this.handleTextChange}
            placeholder="Enter words found in name"
            value={data.text || ""}
          />
        </FormGroup>
      </DSLFormWithExpressionUpdates>
    );
  }
}

FuzzyTextDSLSection.propTypes = {
  onApply: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  expression: PropTypes.instanceOf(DSLExpression).isRequired
};

module.exports = FuzzyTextDSLSection;
