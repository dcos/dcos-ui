import React from 'react';

class FilterBar extends React.Component {

  getFilterBarLeft(filterItems, rightAlignCount) {
    if (filterItems.length === rightAlignCount) {
      return null;
    }

    if (rightAlignCount > 0) {
      filterItems = filterItems.slice(0, filterItems.length - rightAlignCount);
    }

    return (
      <div className="filter-bar-left">
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
    let {className, rightAlignLastNChildren} = this.props;
    let filterItems = React.Children.toArray(this.props.children);

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
  rightAlignLastNChildren: React.PropTypes.number
};

FilterBar.defaultProps = {
  className: 'filter-bar',
  rightAlignLastNChildren: 0
};

module.exports = FilterBar;
