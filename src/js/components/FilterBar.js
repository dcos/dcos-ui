import PureRender from "react-addons-pure-render-mixin";
import React from "react";

class FilterBar extends React.Component {
  constructor() {
    super(...arguments);
    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);
  }

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
    } else {
      filterItems = filterItems.slice(rightAlignCount * -1);
    }

    return (
      <div className={this.props.rightChildrenClass}>
        {this.getFilterItems(filterItems)}
      </div>
    );
  }

  getFilterItems(filterItemArray) {
    return filterItemArray.map(function(item, index) {
      return (
        <div className="filter-bar-item" key={index}>
          {item}
        </div>
      );
    });
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

FilterBar.propTypes = {
  className: React.PropTypes.string,
  rightAlignLastNChildren: React.PropTypes.number,
  leftChildrenClass: React.PropTypes.string,
  rightChildrenClass: React.PropTypes.string
};

FilterBar.defaultProps = {
  className: "filter-bar",
  leftChildrenClass: "filter-bar-left",
  rightAlignLastNChildren: 0,
  rightChildrenClass: "filter-bar-right"
};

module.exports = FilterBar;
