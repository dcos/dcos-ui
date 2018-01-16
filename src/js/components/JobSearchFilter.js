/* eslint-disable no-unused-vars */
import PropTypes from "prop-types";

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
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string
};

module.exports = JobSearchFilter;
