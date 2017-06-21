import classNames from "classnames";
import PureRender from "react-addons-pure-render-mixin";
import React, { PropTypes } from "react";

import StringUtil from "../utils/StringUtil";

const METHODS_TO_BIND = ["handleReset"];

class FilterHeadline extends React.Component {
  constructor() {
    super(...arguments);
    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleReset(e) {
    e.preventDefault();
    this.props.onReset();
  }

  render() {
    let {
      className,
      currentLength,
      inverseStyle,
      isFiltering,
      name,
      totalLength
    } = this.props;
    const hideFilteredClasses =
      (isFiltering == null && currentLength === totalLength) ||
      (isFiltering != null && !isFiltering);
    name = StringUtil.pluralize(name, totalLength);

    const filteredClassSet = classNames("flush", {
      inverse: inverseStyle,
      hidden: hideFilteredClasses
    });

    const unfilteredClassSet = classNames("flush", {
      inverse: inverseStyle,
      hidden: !hideFilteredClasses
    });

    const anchorClassSet = classNames("clickable flush-top", {
      inverse: inverseStyle,
      hidden: hideFilteredClasses
    });

    const listClassSet = classNames(
      "filter-headline list list-unstyled list-inline h4 flush-left flush-top",
      {
        inverse: inverseStyle
      },
      className
    );

    return (
      <ul className={listClassSet}>
        <li className={filteredClassSet}>
          Showing {currentLength} of {totalLength} {name}
        </li>
        <li className={anchorClassSet} onClick={this.handleReset}>
          <a className="small flush">
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
  className: PropTypes.string,
  currentLength: PropTypes.number.isRequired,
  inverseStyle: PropTypes.bool,
  // Optional prop used to force the "Clear" button to show even when n of n
  // items are currently displayed.
  isFiltering: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onReset: PropTypes.func.isRequired,
  totalLength: PropTypes.number.isRequired
};

module.exports = FilterHeadline;
