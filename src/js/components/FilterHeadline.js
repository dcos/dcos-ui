var classNames = require('classnames');
var React = require('react');

import StringUtil from '../utils/StringUtil';

var FilterHeadline = React.createClass({

  displayName: 'FilterHeadline',

  propTypes: {
    onReset: React.PropTypes.func.isRequired,
    name: React.PropTypes.string.isRequired,
    currentLength: React.PropTypes.number.isRequired,
    totalLength: React.PropTypes.number.isRequired,
    inverseStyle: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      inverseStyle: false
    };
  },

  handleReset: function (e) {
    e.preventDefault();
    this.props.onReset();
  },

  render: function () {
    var filteredLength = this.props.currentLength;
    var totalLength = this.props.totalLength;
    let inverseStyle = this.props.inverseStyle;
    let name = StringUtil.pluralize(this.props.name, totalLength);

    var filteredClassSet = classNames({
      'h4': true,
      'inverse': inverseStyle,
      'hidden': filteredLength === totalLength
    });

    var unfilteredClassSet = classNames({
      'h4': true,
      'inverse': inverseStyle,
      'hidden': filteredLength !== totalLength
    });

    var anchorClassSet = classNames({
      'h4 clickable': true,
      'inverse': inverseStyle,
      'hidden': filteredLength === totalLength
    });

    let listClassSet = classNames({
      'list-unstyled list-inline': true,
      'inverse': inverseStyle
    });

    return (
      <ul className={listClassSet}>
        <li className={filteredClassSet}>
          Showing {filteredLength} of {totalLength} {name}
        </li>
        <li className={anchorClassSet} onClick={this.handleReset}>
          <a className="small">
            (Show all)
          </a>
        </li>
        <li className={unfilteredClassSet}>
          {totalLength} {name}
        </li>
      </ul>
    );
  }
});

module.exports = FilterHeadline;
