import PropTypes from "prop-types";
import * as React from "react";

class FilterBar extends React.PureComponent {
  static defaultProps = {
    className: "filter-bar",
    leftChildrenClass: "filter-bar-left",
    rightAlignLastNChildren: 0,
    rightChildrenClass: "filter-bar-right",
  };
  static propTypes = {
    className: PropTypes.string,
    rightAlignLastNChildren: PropTypes.number,
    leftChildrenClass: PropTypes.string,
    rightChildrenClass: PropTypes.string,
  };
  getFilterBarLeft(filterItems, rightAlignCount) {
    if (filterItems.length === rightAlignCount) {
      return null;
    }

    if (rightAlignCount > 0) {
      filterItems = filterItems.slice(0, filterItems.length - rightAlignCount);
    }

    return (
      <div className={this.props.leftChildrenClass}>
        {this.getFilterItems(filterItems)}
      </div>
    );
  }

  getFilterBarRight(filterItems, rightAlignCount) {
    if (rightAlignCount === 0) {
      return null;
    }
    filterItems = filterItems.slice(rightAlignCount * -1);

    return (
      <div className={this.props.rightChildrenClass}>
        {this.getFilterItems(filterItems)}
      </div>
    );
  }

  getFilterItems(filterItemArray) {
    return filterItemArray.map((item, index) => (
      <div className="filter-bar-item" key={index}>
        {item}
      </div>
    ));
  }

  render() {
    const { className, rightAlignLastNChildren } = this.props;
    const filterItems = React.Children.toArray(this.props.children);

    return (
      <div className={className}>
        {this.getFilterBarLeft(filterItems, rightAlignLastNChildren)}
        {this.getFilterBarRight(filterItems, rightAlignLastNChildren)}
      </div>
    );
  }
}

export default FilterBar;
