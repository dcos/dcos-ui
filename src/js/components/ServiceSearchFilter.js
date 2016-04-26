import mixin from 'reactjs-mixin';
import React from 'react';

import FilterInputText from './FilterInputText';
import QueryParamsMixin from '../mixins/QueryParamsMixin';
import ServiceFilterTypes from '../constants/ServiceFilterTypes';

const METHODS_TO_BIND = ['setSearchString'];

class ServiceSearchFilter extends mixin(QueryParamsMixin) {
  static get defaultProps() {
    return {
    };
  }

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
      <FilterInputText
        searchString={this.state.searchString}
        handleFilterChange={this.setSearchString} />
    );
  }
};

module.exports = ServiceSearchFilter;
