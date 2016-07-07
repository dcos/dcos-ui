import React, {PropTypes} from 'react';
import classNames from 'classnames';

import StringUtil from '../utils/StringUtil';

const METHODS_TO_BIND = [
  'handleReset'
];

class FilterHeadline extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleReset(e) {
    e.preventDefault();
    this.props.onReset();
  }

  render() {
    let {currentLength, inverseStyle, name, totalLength} = this.props;
    name = StringUtil.pluralize(name, totalLength);

    let filteredClassSet = classNames({
      'h4': true,
      'inverse': inverseStyle,
      'hidden': filteredLength === totalLength
    });

    let unfilteredClassSet = classNames({
      'h4': true,
      'inverse': inverseStyle,
      'hidden': filteredLength !== totalLength
    });

    let anchorClassSet = classNames({
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
          Showing {currentLength} of {totalLength} {name}
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
}

FilterHeadline.defaultProps = {
  inverseStyle: false
};

FilterHeadline.propTypes = {
  currentLength: PropTypes.number.isRequired,
  inverseStyle: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onReset: PropTypes.func.isRequired,
  totalLength: PropTypes.number.isRequired
};

module.exports = FilterHeadline;
