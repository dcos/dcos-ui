/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import FilterInputText from "./FilterInputText";

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
  onChange: React.PropTypes.func.isRequired,
  value: React.PropTypes.string
};

module.exports = JobSearchFilter;
