import classNames from 'classnames';
import React, {PropTypes} from 'react';

import Icon from './Icon';
import ServiceFilterTypes from '../../../plugins/services/src/js/constants/ServiceFilterTypes';

let METHODS_TO_BIND = [
  'handleBlur',
  'handleFocus',
  'handleChange',
  'handleInputClear'
];

class FilterInputText extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      focus: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidUpdate(prevProps, prevState) {
    let {focus} = this.state;

    if (prevState.focus !== focus && focus && this.inputField) {
      this.inputField.focus();
    }
  }

  handleChange(event) {
    let {target} = event;

    // Make sure to never emit falsy values
    let value = target.value || '';
    this.props.handleFilterChange(value, ServiceFilterTypes.TEXT);
  }

  handleInputClear() {
    this.props.handleFilterChange('', ServiceFilterTypes.TEXT);
  }

  handleBlur() {
    this.setState({
      focus: false
    });
  }

  handleFocus() {
    this.setState({
      focus: true
    });
  }

  getInputField() {
    let {inverseStyle, placeholder, searchString} = this.props;

    let inputClasses = classNames({
      'form-control filter-input-text': true,
      'form-control-inverse': inverseStyle
    });

    return (
      <input
        className={inputClasses}
        placeholder={placeholder}
        onChange={this.handleChange}
        ref={(ref) => this.inputField = ref}
        type="text"
        value={searchString} />
    );
  }

  getClearIcon() {
    if (!this.props.searchString) {
      return null;
    }

    let {inverseStyle, sideText} = this.props;
    let color = 'white';

    if (!inverseStyle) {
      color = 'purple';
    }

    let iconClassNames = classNames('clickable', {
      'icon-margin-left': !!sideText
    });

    return (
      <span className="form-control-group-add-on">
        {sideText}
        <a onClick={this.handleInputClear}>
          <Icon
            family="mini"
            id="ring-close"
            size="mini"
            className={iconClassNames}
            color={color} />
        </a>
      </span>
    );
  }

  render() {
    let {className, inputContainerClass, inverseStyle} = this.props;
    let {focus} = this.state;

    let iconColor = 'grey';
    let iconSearchClasses = classNames({
      'active': focus
    });

    if (!inverseStyle && focus) {
      iconColor = 'purple';
    }

    let inputContainerClasses = classNames({
      'form-control form-control-group filter-input-text-group': true,
      'form-control-inverse': inverseStyle,
      'focus': focus
    }, inputContainerClass);

    let formGroupClasses = classNames(
      'form-group',
      className
    );

    return (
      <div className={formGroupClasses}>
        <div className={inputContainerClasses}
          onClick={this.handleFocus}
          onBlur={this.handleBlur}>
          <span className="form-control-group-add-on form-control-group-add-on-prepend">
            <Icon
              family="mini"
              id="search"
              size="mini"
              className={iconSearchClasses}
              color={iconColor} />
          </span>
          {this.getInputField()}
          {this.getClearIcon()}
        </div>
      </div>
    );
  }
}

FilterInputText.defaultProps = {
  inverseStyle: false,
  placeholder: 'Filter',
  sideText: null
};

FilterInputText.propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  inverseStyle: PropTypes.bool,
  placeholder: PropTypes.string,
  searchString: PropTypes.string.isRequired,
  sideText: PropTypes.node
};

module.exports = FilterInputText;
