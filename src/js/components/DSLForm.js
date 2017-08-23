/* @flow */
import React, { PropTypes } from "react";

import DSLExpression from "../structs/DSLExpression";

type Props = {
  onApply?: Function,
  onChange?: Function,
  sections: Array<any>,
  expression: DSLExpression
};

/**
 * This component wraps one or more DSLOptionSection components and
 * handles the transparent mutation of the expression based on user actions.
 */
class DSLForm extends React.Component {

  /**
   * @override
   */
  render() {
    const { expression, onApply, onChange, sections } = this.props;

    // Render each group component wrapped with a dedicated form that receives
    // the updates targeting each dedicated component.
    const components = sections.map((SectionComponent, key) => {
      return (
        <SectionComponent
          expression={expression}
          key={key}
          onApply={onApply}
          onChange={onChange}
        />
      );
    });

    return (
      <div>
        {components}
      </div>
    );
  }
}

DSLForm.defaultProps = {
  onApply() {},
  onChange() {}
};

module.exports = DSLForm;
