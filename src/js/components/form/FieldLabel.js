import React from 'react';

const FieldLabel = (props) => {
  return (
    <label {...props} />
  );
};

FieldLabel.propTypes = {
  // Classes
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = FieldLabel;
