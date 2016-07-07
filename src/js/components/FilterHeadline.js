import classNames from 'classnames';
import React, {PropTypes} from 'react';

import StringUtil from '../utils/StringUtil';

const METHODS_TO_BIND = [
  'handleReset'
];

class FilterHeadline extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleReset(e) {
    e.preventDefault();
    this.props.onReset();
  }

  render() {
    let {currentLength, inverseStyle, isFiltering, name, totalLength} = this.props;
    let hideFilteredClasses = (isFiltering == null && currentLength === totalLength) || (isFiltering != null && !isFiltering);
    name = StringUtil.pluralize(name, totalLength);

    let filteredClassSet = classNames({
      'h4': true,
      'inverse': inverseStyle,
      'hidden': hideFilteredClasses
    });

    let unfilteredClassSet = classNames({
      'h4': true,
      'inverse': inverseStyle,
      'hidden': !hideFilteredClasses
    });

    let anchorClassSet = classNames({
      'h4 clickable': true,
      'inverse': inverseStyle,
      'hidden': hideFilteredClasses
    });

    let listClassSet = classNames({
      'list-unstyled list-inline': true,
      'inverse': inverseStyle
    });

    return (
      <ul className={listClassSet}>
        <li className={filteredClassSet}>
          Showing {currentLength} of {totalLength} {name}
        </li>
        <li className={anchorClassSet} onClick={this.handleReset}>
          <a className="small">
            (Clear)
          </a>
        </li>
        <li className={unfilteredClassSet}>
          {totalLength} {name}
        </li>
      </ul>
    );
  }
}

FilterHeadline.defaultProps = {
  inverseStyle: false
};

FilterHeadline.propTypes = {
  currentLength: PropTypes.number.isRequired,
  inverseStyle: PropTypes.bool,
  // Optional prop used to force the "Clear" button to show even when n of n
  // items are currenetly displayed.
  isFiltering: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onReset: PropTypes.func.isRequired,
  totalLength: PropTypes.number.isRequired
};

module.exports = FilterHeadline;
