/* @flow */
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import FilterInputText from "./FilterInputText";

type Props = {
  onChange: Function,
  value?: string
};

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

module.exports = JobSearchFilter;
