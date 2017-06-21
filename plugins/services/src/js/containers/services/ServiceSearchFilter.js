import React, { PropTypes } from "react";

import FilterInputText
  from "../../../../../../src/js/components/FilterInputText";
import ServiceFilterTypes from "../../constants/ServiceFilterTypes";

class ServiceSearchFilter extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.filters.searchString !== this.props.filters.searchString;
  }

  setSearchString(filterValue) {
    this.props.handleFilterChange(ServiceFilterTypes.TEXT, filterValue);
  }

  render() {
    const searchString = this.props.filters[ServiceFilterTypes.TEXT] || "";

    return (
      <FilterInputText
        className="flush-bottom"
        handleFilterChange={value => {
          this.setSearchString(value);
        }}
        placeholder="Search"
        searchString={searchString}
      />
    );
  }
}

ServiceSearchFilter.propTypes = {
  filters: PropTypes.object,
  handleFilterChange: PropTypes.func.isRequired
};

module.exports = ServiceSearchFilter;
