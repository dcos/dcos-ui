import classNames from 'classnames';
import React, {PropTypes} from 'react';

import Icon from './Icon';
import ServiceFilterTypes from '../constants/ServiceFilterTypes';

let METHODS_TO_BIND = [
  'handleBlur',
  'handleFocus',
  'handleChange',
  'handleClearInput',
  'handleInputChange'
];

class FilterInputText extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      focus: false
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.state !== this.state.focus && this.state.focus && this.inputField) {
      this.inputField.focus();
    }
  }

  handleChange(e) {
    let {target} = e;

    this.props.handleFilterChange(target.value,
      ServiceFilterTypes.TEXT);
  }

  handleClearInput() {
    this.props.handleFilterChange('', ServiceFilterTypes.TEXT);
  }

  handleInputChange() { }

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
    let {inverseStyle, sideText} = this.props;
    let color = 'white';

    if (!inverseStyle) {
      color = 'purple';
    }

    let iconClassNames = classNames('clickable', {
      'icon-margin-left': !!props.sideText
    });

    return (
      <span className="form-control-group-add-on form-control-group-add-on-append">
        {sideText}
        <a onClick={this.handleClearInput}>
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

  renderClearIcon() {
    if (this.props.searchString) {
      return this.getClearIcon();
    }
  }

  render() {
    let props = this.props;
    let focus = this.state.focus;

    let iconColor = 'white';
    let iconSearchClasses = classNames({
      'active': focus
    });

    if (!props.inverseStyle && focus) {
      iconColor = 'purple';
    }

    let inputContainerClasses = classNames({
      'form-control form-control-group filter-input-text-group': true,
      'form-control-inverse': props.inverseStyle,
      'focus': focus
    }, props.inputContainerClass);

    let formGroupClasses = classNames(
      'form-group',
      props.className
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
          {this.renderClearIcon()}
        </div>
      </div>
    );
  }
}

FilterInputText.defaultProps = {
  handleFilterChange: function () {},
  inverseStyle: false,
  placeholder: 'Filter',
  searchString: ''
};

FilterInputText.propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  inverseStyle: PropTypes.bool,
  placeholder: PropTypes.string,
  searchString: PropTypes.string.isRequired,
  sideText: PropTypes.node
};

module.exports = FilterInputText;
