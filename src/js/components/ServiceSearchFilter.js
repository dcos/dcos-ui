import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import FilterBar from '../components/FilterBar';
import FilterInputText from './FilterInputText';
import QueryParamsMixin from '../mixins/QueryParamsMixin';
import ServiceFilterTypes from '../constants/ServiceFilterTypes';

const METHODS_TO_BIND = ['setSearchString'];

class ServiceSearchFilter extends mixin(QueryParamsMixin) {
  constructor() {
    super();

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
    this.setQueryParam(ServiceFilterTypes.TEXT, filterValue);
    this.props.handleFilterChange(filterValue, ServiceFilterTypes.TEXT);
  }

  updateFilterStatus() {
    let {state} = this;
    let searchString =
      this.getQueryParamObject()[ServiceFilterTypes.TEXT] || '';

    if (searchString !== state.searchString) {
      this.setState({searchString},
        this.props.handleFilterChange.bind(null, searchString, ServiceFilterTypes.TEXT));
    }
  }

  render() {
    return (
      <FilterBar
        rightAlignLastNChildren={2}>
        <FilterInputText
          className="flush-bottom"
          handleFilterChange={this.setSearchString}
          inverseStyle={true}
          placeholder="Search"
          searchString={this.state.searchString} />
        <button className="button button-stroke button-inverse">
          Create Group
        </button>
        <button className="button button-success">
          Deploy Service
        </button>
      </FilterBar>
    );
  }
};

module.exports = ServiceSearchFilter;
