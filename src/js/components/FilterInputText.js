var classNames = require('classnames');
var React = require('react');

var FilterInputText = React.createClass({

  displayName: 'FilterInputText',

  propTypes: {
    handleFilterChange: React.PropTypes.func.isRequired,
    inverseStyle: React.PropTypes.bool,
    placeholder: React.PropTypes.string,
    searchString: React.PropTypes.string.isRequired
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
    this.props.handleFilterChange(this.refs.filterInput.value);
  },

  handleClearInput: function () {
    this.props.handleFilterChange('');
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

      var clearIconClasses = classNames({
        'clickable icon icon-sprite icon-sprite-mini icon-close': true,
        'icon-sprite-mini-white': props.inverseStyle
      });

      return (
        <span className="form-control-group-add-on form-control-group-add-on-append" onClick={this.handleClearInput}>
          <a>
            <i className={clearIconClasses}></i>
          </a>
        </span>
      );
    }

    return null;
  },

  render: function () {
    var props = this.props;
    var focus = this.state.focus;

    var iconSearchClasses = classNames({
      'icon icon-sprite icon-sprite-mini icon-search': true,
      'icon-sprite-mini-white': props.inverseStyle,
      'icon-sprite-mini-color': !props.inverseStyle && focus,
      'active': focus
    });

    var inputClasses = classNames({
      'form-control filter-input-text': true,
      'form-control-inverse': props.inverseStyle
    });

    let inputContainerClasses = classNames({
      'form-control form-control-group filter-input-text-group': true,
      'form-control-inverse': props.inverseStyle,
      'focus': focus
    });

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
            <i className={iconSearchClasses}></i>
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
