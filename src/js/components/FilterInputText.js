var classNames = require('classnames');
var React = require('react');

import Icon from './Icon';
import ServiceFilterTypes from '../constants/ServiceFilterTypes';

var FilterInputText = React.createClass({

  displayName: 'FilterInputText',

  propTypes: {
    handleFilterChange: React.PropTypes.func.isRequired,
    inverseStyle: React.PropTypes.bool,
    placeholder: React.PropTypes.string,
    searchString: React.PropTypes.string.isRequired,
    sideText: React.PropTypes.node
  },

  getDefaultProps: function () {
    return {
      inverseStyle: false,
      placeholder: 'Filter',
      searchString: ''
    };
  },

  getInitialState: function () {
    return {
      focus: false
    };
  },

  componentDidUpdate: function () {
    if (this.state.focus) {
      this.refs.filterInput.focus();
    }
  },

  handleChange: function (e) {
    e.preventDefault();
    this.props.handleFilterChange(this.refs.filterInput.value,
      ServiceFilterTypes.TEXT);
  },

  handleClearInput: function () {
    this.props.handleFilterChange('', ServiceFilterTypes.TEXT);
  },

  handleBlur: function () {
    this.setState({
      focus: false
    });
  },

  handleFocus: function () {
    this.setState({
      focus: true
    });
  },

  renderClearIcon: function (props) {

    if (props.searchString) {
      let color = 'white';

      if (!props.inverseStyle) {
        color = 'purple';
      }

      return (
        <span className="form-control-group-add-on form-control-group-add-on-append">
          {props.sideText}
          <a onClick={this.handleClearInput}>
          <Icon
            family="mini"
            id="ring-close"
            size="mini"
            className="clickable"
            color={color} />
          </a>
        </span>
      );
    }

    return null;
  },

  render: function () {
    var props = this.props;
    var focus = this.state.focus;

    let iconColor = 'white';
    let iconSearchClasses = classNames({
      'active': focus
    });

    if (!props.inverseStyle && focus) {
      iconColor = 'purple';
    }

    var inputClasses = classNames({
      'form-control filter-input-text': true,
      'form-control-inverse': props.inverseStyle
    });

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
          <input
            type="text"
            className={inputClasses}
            placeholder={props.placeholder}
            value={props.searchString}
            onChange={this.handleChange}
            ref="filterInput" />
          {this.renderClearIcon(props)}
        </div>
      </div>
    );
  }
});

module.exports = FilterInputText;
