import classNames from 'classnames/dedupe';
import React from 'react';

import FieldInput from './FieldInput';
import Util from '../../utils/Util';

class FieldTextarea extends FieldInput {
  render() {
    let {
      error,
      formGroupClass,
      formGroupErrorClass
    } = this.props;
    let attributes = Util.omit(this.props, Object.keys(FieldInput.propTypes));

    let classes = classNames(
      {[formGroupErrorClass]: !!error},
      formGroupClass
    );

    return (
      <div className={classes}>
        {this.getLabel()}
        <textarea {...attributes} />
        {this.getHelpBlock()}
        {this.getErrorMsg()}
      </div>
    );
  }
}

FieldTextarea.defaultProps = Object.assign({}, FieldInput.defaultProps);

FieldTextarea.propTypes = Object.assign({}, FieldInput.propTypes);

module.exports = FieldTextarea;
