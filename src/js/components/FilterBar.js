import React from 'react';

class FilterBar extends React.Component {

  getFilterBarLeft(filterItems, rightAlignCount) {
    if (rightAlignCount) {
      filterItems = filterItems.slice(0, filterItems.length - rightAlignCount);
    }

    return (
      <div className="filter-bar-left">
        {this.getFilterItems(filterItems)}
      </div>
    );
  }

  getFilterBarRight(filterItems, rightAlignCount) {
    if (!rightAlignCount) {
      return null;
    } else {
      filterItems = filterItems.slice(rightAlignCount * -1);
    }

    return (
      <div className="filter-bar-right">
        {this.getFilterItems(filterItems)}
      </div>
    );
  }

  getFilterItems(filterItemArray) {
    return filterItemArray.map(function (item, index) {
      return (
        <div className="filter-bar-item" key={index}>
          {item}
        </div>
      );
    });
  }

  render() {
    let {rightAlignLastChild, rightAlignLastNChildren} = this.props;
    let filterItems = React.Children.toArray(this.props.children);

    if (rightAlignLastChild) {
      rightAlignLastNChildren = 1;
    }

    return (
      <div className="filter-bar">
        {this.getFilterBarLeft(filterItems, rightAlignLastNChildren)}
        {this.getFilterBarRight(filterItems, rightAlignLastNChildren)}
      </div>
    );
  }
}

FilterBar.propTypes = {
  rightAlignLastChild: React.PropTypes.bool,
  rightAlignLastNChildren: React.PropTypes.number
};

FilterBar.defaultProps = {
  rightAlignLastChild: false
};

module.exports = FilterBar;
