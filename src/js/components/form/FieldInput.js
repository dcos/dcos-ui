import classNames from 'classnames/dedupe';
import deepEqual from 'deep-equal';
import React from 'react';

import Util from '../../utils/Util';

class FieldInput extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !deepEqual(this.props, nextProps);
  }

  getErrorMsg() {
    let {helpBlockClass, error} = this.props;

    if (!error) {
      return null;
    }

    return (
      <span className={classNames(helpBlockClass)}>
        {error}
      </span>
    );
  }

  getHelpBlock() {
    let {helpBlock, helpBlockClass} = this.props;

    if (!helpBlock) {
      return null;
    }

    return (
      <p className={classNames(helpBlockClass)}>
        {helpBlock}
      </p>
    );
  }

  getLabel() {
    let {label, labelClass} = this.props;

    if (!label) {
      return null;
    }

    if (typeof label !== 'string') {
      return label;
    }

    return (
      <label className={classNames(labelClass)}>
        {label}
      </label>
    );
  }

  getElement(attributes) {
    return (
      <input {...attributes} />
    );
  }

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
        {this.getElement(attributes)}
        {this.getHelpBlock()}
        {this.getErrorMsg()}
      </div>
    );
  }
}

FieldInput.defaultProps = {
  className: 'form-control',
  formGroupClass: 'form-group',
  helpBlockClass: 'small flush-bottom',
  onChange() {},
  value: ''
};

let classPropType = React.PropTypes.oneOfType([
  React.PropTypes.array,
  React.PropTypes.object,
  React.PropTypes.string
]);

FieldInput.propTypes = {
  // Optional boolean, string, or react node.
  // If boolean: true - shows name as label; false - shows nothing.
  // If string: shows string as label.
  // If node: returns the node as the label.
  label: React.PropTypes.oneOfType([
    React.PropTypes.node,
    React.PropTypes.string
  ]),
  // Optional help block
  helpBlock: React.PropTypes.node,
  // Optional error messages node
  error: React.PropTypes.node,

  // Classes
  formGroupClass: classPropType,
  // Class to be toggled, can be overridden by formGroupClass
  formGroupErrorClass: React.PropTypes.string,
  helpBlockClass: classPropType,
  labelClass: classPropType
};

module.exports = FieldInput;
