import classNames from "classnames";
import React from "react";

class FilterButtons extends React.Component {
  getCount(items) {
    const counts = {};

    items.forEach(function(value) {
      if (typeof value === "string") {
        value = value.toLowerCase();
      }

      counts[value] = counts[value] + 1 || 1;
    });

    // Include a key 'all' that is the total itemList size.
    counts.all = items.length;

    return counts;
  }

  handleFilterChange(filter) {
    this.props.onFilterChange(filter);
  }

  getFilterButtons() {
    let {
      filterByKey,
      filters,
      inverseStyle,
      itemList,
      selectedFilter
    } = this.props;

    if (filterByKey) {
      itemList = itemList.map(function(item) {
        return item[filterByKey];
      });
    }

    const filterCount = this.getCount(itemList);

    return filters.map(filter => {
      const classSet = classNames("button button-stroke", {
        "button-inverse": inverseStyle,
        active: filter.toLowerCase() === selectedFilter.toLowerCase()
      });

      return (
        <button
          key={filter}
          className={classSet}
          onClick={this.handleFilterChange.bind(this, filter)}
        >
          {this.props.renderButtonContent(filter, filterCount[filter])}
        </button>
      );
    });
  }

  render() {
    return (
      <div className="button-group flush-bottom">
        {this.getFilterButtons()}
      </div>
    );
  }
}

FilterButtons.defaultProps = {
  inverseStyle: false,
  onFilterChange() {},
  renderButtonContent(title) {
    return title;
  }
};

FilterButtons.propTypes = {
  filters: React.PropTypes.array,
  // The key in itemList that is being filtered
  filterByKey: React.PropTypes.string,
  inverseStyle: React.PropTypes.bool,
  itemList: React.PropTypes.array.isRequired,
  // A function that returns the onClick for a filter button given the filter.
  onFilterChange: React.PropTypes.func,
  // Optional function to generate button text. args: (filter, count)
  renderButtonContent: React.PropTypes.func,
  // The filter in props.filters that is currently selected.
  selectedFilter: React.PropTypes.string
};

module.exports = FilterButtons;
