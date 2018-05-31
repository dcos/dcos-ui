/* eslint-disable no-unused-vars */
import PropTypes from "prop-types";
import React from "react";

// everything that is references as #ALIAS/something has to be refactored once our DI system is in place
import FilterInputText from "#SRC/js/components/FilterInputText";

class JobSearchFilter extends React.Component {
  render() {
    return (
      <FilterInputText
        className="flush-bottom"
        handleFilterChange={this.props.onChange}
        placeholder="Search"
        searchString={this.props.value}
      />
    );
  }
}

JobSearchFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string
};

module.exports = JobSearchFilter;
