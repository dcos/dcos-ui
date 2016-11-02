import React from 'react';

import FieldInput from './FieldInput';

class FieldTextarea extends FieldInput {
  getElement(attributes) {
    return (
      <textarea {...attributes} />
    );
  }
}

FieldTextarea.defaultProps = Object.assign({}, FieldInput.defaultProps);

FieldTextarea.propTypes = Object.assign({}, FieldInput.propTypes);

module.exports = FieldTextarea;
