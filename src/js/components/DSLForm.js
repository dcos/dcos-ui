import React, {PropTypes} from 'react';

import DSLExpression from '../structs/DSLExpression';

/**
 * This component wraps one or more DSLOptionSection components and
 * handles the transparent mutation of the expression based on user actions.
 */
class DSLForm extends React.Component {
  /**
   * @override
   */
  render() {
    const {expression, onChange, sections} = this.props;

    // Render each group component wrapped with a dedicated form that receives
    // the updates targeting each dedicated component.
    return (
      <div>
        {sections.map((SectionComponent, key) => {
          return (
            <SectionComponent
              expression={expression}
              key={key}
              onChange={onChange} />
          );
        })}
      </div>
    );
  }
}

DSLForm.defaultProps = {
  onChange() {}
};

DSLForm.propTypes = {
  onChange: PropTypes.func,
  sections: PropTypes.array.isRequired,
  expression: PropTypes.instanceOf(DSLExpression).isRequired
};

module.exports = DSLForm;
