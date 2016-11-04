import React from 'react';

import Util from '../../utils/Util';

const FieldLabel = (props) => {
  let {children, required} = props;
  let requiredNode;
  if (required) {
    requiredNode = <span className="text-danger"> *</span>;
  }

  return (
    <label {...Util.omit(props, ['required', 'children'])}>
      {children}
      {requiredNode}
    </label>
  );
};

FieldLabel.propTypes = {
  // Optional boolean to show a required indicator
  required: React.PropTypes.bool,
  // Classes
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = FieldLabel;
