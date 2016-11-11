import classNames from 'classnames/dedupe';
import React from 'react';

import FieldError from './FieldError';
import {omit} from '../../utils/Util';

const FormGroup = (props) => {
  let {children, className, errorClassName, showError, required} = props;

  let clonedChildren = React.Children.map(children, (child) => {
    if (child == null || (!showError && child.type === FieldError)) {
      return null;
    }

    return React.cloneElement(child, {required});
  });

  let classes = classNames(
    {[errorClassName]: showError},
    'form-group',
    className
  );

  return (
    <div
      className={classes}
      {...omit(props, Object.keys(FormGroup.propTypes))}>
      {clonedChildren}
    </div>
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
  children: React.PropTypes.node,
  // Optional boolean to display error
  showError: React.PropTypes.bool,

  // Optional boolean to make field required
  required: React.PropTypes.bool,

  // Classes
  className: classPropType,
  // Class to be toggled, can be overridden by className
  errorClassName: React.PropTypes.string
};

module.exports = FormGroup;
