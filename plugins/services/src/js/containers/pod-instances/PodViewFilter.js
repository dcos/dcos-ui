import React from "react";

import FilterBar from "../../../../../../src/js/components/FilterBar";
import FilterButtons from "../../../../../../src/js/components/FilterButtons";
import FilterInputText
  from "../../../../../../src/js/components/FilterInputText";
import StringUtil from "../../../../../../src/js/utils/StringUtil";

const METHODS_TO_BIND = [
  "getFilterButtonContent",
  "handleStatusFilterChange",
  "handleSearchStringChange"
];

class PodViewFilter extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(function(method) {
      this[method] = this[method].bind(this);
    }, this);
  }

  handleStatusFilterChange(filterByStatus) {
    this.props.onFilterChange(
      Object.assign({}, this.props.filter, {
        status: filterByStatus
      })
    );
  }

  handleSearchStringChange(searchString = "") {
    this.props.onFilterChange(
      Object.assign({}, this.props.filter, {
        text: searchString
      })
    );
  }

  getFilterButtonContent(filterName, count) {
    return (
      <span className="button-align-content badge-container">
        <span className="badge-container-text label flush">
          {StringUtil.capitalize(filterName)}
        </span>
        <span className="badge badge-rounded">{count || 0}</span>
      </span>
    );
  }

  getFilterButtons() {
    const {
      filter,
      items,
      inverseStyle,
      statusMapper,
      statusChoices
    } = this.props;
    if (!statusChoices.length) {
      return null;
    }

    return (
      <FilterButtons
        renderButtonContent={this.getFilterButtonContent}
        filters={statusChoices}
        onFilterChange={this.handleStatusFilterChange}
        inverseStyle={inverseStyle}
        itemList={items.map(statusMapper)}
        selectedFilter={filter.status}
      />
    );
  }

  render() {
    const { children, filter, inverseStyle } = this.props;
    const childrenCount = React.Children.count(children);

    return (
      <FilterBar rightAlignLastNChildren={childrenCount}>
        <FilterInputText
          className="flush-bottom"
          searchString={filter.text}
          handleFilterChange={this.handleSearchStringChange}
          inverseStyle={inverseStyle}
        />
        {this.getFilterButtons()}
        {children}
      </FilterBar>
    );
  }
}

PodViewFilter.defaultProps = {
  filter: {
    text: "",
    status: ""
  },
  items: [],
  inverseStyle: false,
  onFilterChange() {},
  statusMapper() {
    return "";
  },
  statusChoices: []
};

PodViewFilter.propTypes = {
  filter: React.PropTypes.shape({
    text: React.PropTypes.string,
    status: React.PropTypes.string
  }),
  items: React.PropTypes.array,
  inverseStyle: React.PropTypes.bool,
  onFilterChange: React.PropTypes.func,
  statusMapper: React.PropTypes.func,
  statusChoices: React.PropTypes.array
};

module.exports = PodViewFilter;
