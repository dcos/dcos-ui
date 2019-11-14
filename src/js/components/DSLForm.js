import PropTypes from "prop-types";
import React from "react";

import DSLExpression from "../structs/DSLExpression";

const DSLForm = props => {
  const { expression, onApply, onChange, sections, defaultData } = props;

  // Render each group component wrapped with a dedicated form that receives
  // the updates targeting each dedicated component.
  const components = sections.map((SectionComponent, key) => (
    <SectionComponent
      expression={expression}
      key={key}
      onApply={onApply}
      onChange={onChange}
      defaultData={defaultData}
    />
  ));

  return <div>{components}</div>;
};

DSLForm.defaultProps = {
  onApply() {},
  onChange() {}
};

DSLForm.propTypes = {
  onApply: PropTypes.func,
  onChange: PropTypes.func,
  sections: PropTypes.array.isRequired,
  expression: PropTypes.instanceOf(DSLExpression).isRequired
};

module.exports = DSLForm;
