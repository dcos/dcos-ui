import classNames from 'classnames/dedupe';
import React from 'react';

import Util from '../../utils/Util';

const FieldInput = (props) => {
  let {className} = props;
  let classes = classNames('form-control', className);

  return (
    <input className={classes} {...Util.omit(props, ['className'])} />
  );
};

FieldInput.defaultProps = {
  onChange() {},
  value: ''
};

FieldInput.propTypes = {
  onChange: React.PropTypes.func,
  value: React.PropTypes.oneOfType([
    React.PropTypes.number,
    React.PropTypes.string
  ]),

  // Classes
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = FieldInput;
