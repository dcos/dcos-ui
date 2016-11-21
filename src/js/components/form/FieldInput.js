import classNames from 'classnames/dedupe';
import React from 'react';

import {omit} from '../../utils/Util';

const FieldInput = (props) => {
  let {className, type, value} = props;
  let additionalProps = {};
  let classes = classNames('form-control', className);

  let toggleIndicator;
  if (['radio', 'checkbox'].includes(type)) {
    toggleIndicator = <span className="form-control-toggle-indicator"></span>;

    if (type === 'checkbox') {
      additionalProps.checked = value;
    }
  }

  return (
    <span>
      <input className={classes}
        {...omit(props, ['className'])}
        {...additionalProps} />
      {toggleIndicator}
    </span>
  );
};

FieldInput.defaultProps = {
  onChange() {},
  value: ''
};

FieldInput.propTypes = {
  type: React.PropTypes.string,
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
