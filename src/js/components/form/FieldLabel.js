import classNames from 'classnames/dedupe';
import React from 'react';

import {omit} from '../../utils/Util';

const FieldLabel = (props) => {
  let {children, className, required} = props;
  let isToggle = false;
  React.Children.forEach(children, (child) => {
    let {props = {}} = child;
    if (['radio', 'checkbox'].includes(props.type)) {
      isToggle = true;
    }
  });
  let classes = classNames(
    {'form-control-toggle form-control-toggle-custom': isToggle},
    className
  );

  let requiredNode;
  if (required) {
    requiredNode = <span className="text-danger"> *</span>;
  }

  return (
    <label className={classes} {...omit(props, Object.keys(FieldLabel.propTypes))}>
      {children}
      {requiredNode}
    </label>
  );
};

FieldLabel.propTypes = {
  children: React.PropTypes.node,
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
