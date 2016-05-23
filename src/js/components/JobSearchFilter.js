import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import FilterInputText from './FilterInputText';
import QueryParamsMixin from '../mixins/QueryParamsMixin';
import JobFilterTypes from '../constants/JobFilterTypes';

const METHODS_TO_BIND = ['setSearchString'];

class JobSearchFilter extends mixin(QueryParamsMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      searchString: ''
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    this.updateFilterStatus();
  }

  componentWillReceiveProps() {
    this.updateFilterStatus();
  }

  setSearchString(filterValue) {
    this.setQueryParam(JobFilterTypes.TEXT, filterValue);
    this.props.handleFilterChange(filterValue, JobFilterTypes.TEXT);
  }

  updateFilterStatus() {
    let {state} = this;
    let searchString =
      this.getQueryParamObject()[JobFilterTypes.TEXT] || '';

    if (searchString !== state.searchString) {
      this.setState({searchString},
        this.props.handleFilterChange.bind(null, searchString, JobFilterTypes.TEXT));
    }
  }

  render() {
    return (
      <FilterInputText
        className="flush-bottom"
        handleFilterChange={this.setSearchString}
        inverseStyle={true}
        placeholder="Search"
        searchString={this.state.searchString} />
    );
  }
};

JobSearchFilter.propTypes = {
  handleFilterChange: React.PropTypes.func.isRequired
};

module.exports = JobSearchFilter;
