import classNames from 'classnames/dedupe';
import React from 'react';

import Util from '../../utils/Util';

const FormGroup = (props) => {
  let {className, errorClassName, hasError} = props;

  let classes = classNames(
    {[errorClassName]: hasError},
    'form-group',
    className
  );

  return (
    <div
      className={classes}
      {...Util.omit(props, Object.keys(FormGroup.propTypes))} />
  );
};

FormGroup.defaultProps = {
  errorClassName: 'form-group-danger'
};

let classPropType = React.PropTypes.oneOfType([
  React.PropTypes.array,
  React.PropTypes.object,
  React.PropTypes.string
]);

FormGroup.propTypes = {
  // Optional error messages node
  hasError: React.PropTypes.bool,

  // Classes
  className: classPropType,
  // Class to be toggled, can be overridden by className
  errorClassName: React.PropTypes.string
};

module.exports = FormGroup;
