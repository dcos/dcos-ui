import classNames from 'classnames/dedupe';
import React from 'react';
import ReactDOM from 'react-dom';

import FieldInput from './FieldInput';
import Util from '../../utils/Util';

let throttle = function (func, wait) {
  let canCall = true;

  let resetCall = function () {
    canCall = true;
  };

  return function () {
    if (canCall) {
      setTimeout(resetCall, wait);
      canCall = false;
      func.apply(this, arguments);
    }
  };
};

const METHODS_TO_BIND = [
  'handleChange'
];

class FieldTextarea extends FieldInput {
  constructor() {
    super(...arguments);

    this.state = {minHeight: this.props.minHeight};
    this.updateTextareaHeight = throttle(this.updateTextareaHeight, 100);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    let inputElement = ReactDOM.findDOMNode(this.refs.inputElement);
    this.updateTextareaHeight(inputElement);

    // React throws a warning if children are specified in an element with
    // contenteditable="true", so this hack allows us to set a default value
    // for this form field.
    if (this.props.value) {
      inputElement.textContent = this.props.value;
    }
  }

  componentDidUpdate() {
    let inputElement = ReactDOM.findDOMNode(this.refs.inputElement);
    this.updateTextareaHeight(inputElement);
  }

  handleChange(event) {
    this.updateTextareaHeight(event.target);

    this.props.onChange(event);
  }

  updateTextareaHeight(domElement) {
    let {minHeight, maxHeight, scrollHeightOffset} = this.props;
    let newHeight = minHeight;
    let {scrollHeight} = domElement;

    if (scrollHeight > minHeight && scrollHeight < maxHeight) {
      newHeight = scrollHeight + scrollHeightOffset;
    } else if (scrollHeight >= maxHeight) {
      newHeight = maxHeight;
    }

    if (newHeight !== this.state.minHeight) {
      this.setState({minHeight: newHeight});
    }
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
        <textarea
          ref="inputElement"
          {...attributes}
          onChange={this.handleChange}
          style={{minHeight: `${this.state.minHeight}px`}} />
        {this.getHelpBlock()}
        {this.getErrorMsg()}
      </div>
    );
  }
}

FieldTextarea.defaultProps = Object.assign({}, FieldInput.defaultProps, {
  maxHeight: 400,
  minHeight: 100,
  scrollHeightOffset: 2
});

FieldTextarea.propTypes = Object.assign({}, FieldInput.propTypes, {
  maxHeight: React.PropTypes.number,
  minHeight: React.PropTypes.number,
  onChange: React.PropTypes.func,
  scrollHeightOffset: React.PropTypes.number
});

module.exports = FieldTextarea;
