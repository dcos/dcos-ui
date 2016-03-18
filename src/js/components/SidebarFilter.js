import {Form} from 'reactjs-components';
import {Link} from 'react-router';
import mixin from 'reactjs-mixin';
import React from 'react';
import update from 'react-addons-update';

import QueryParamsMixin from '../mixins/QueryParamsMixin';

class SidebarFilter extends mixin(QueryParamsMixin) {
  constructor() {
    super();

    this.state = {
      selectedNodes: []
    };
  }

  componentDidMount() {
    this.updateFilterStatus();
  }

  componentWillReceiveProps() {
    this.updateFilterStatus();
  }

  handleFormChange(model, eventObj) {
    let selectedNodes = [];
    let state = this.state;
    let {filterType, filterValues} = this.props;

    if (eventObj.fieldValue) {
      selectedNodes = update(state.selectedNodes, {
        $push: [filterValues[eventObj.fieldName]]
      });
    } else {
      let index = state.selectedNodes
        .indexOf(filterValues[eventObj.fieldName].toString());

      if (index !== -1) {
        selectedNodes = update(state.selectedNodes, {
          $splice: [[index, 1]]
        });
      }
    }

    this.setQueryParam(filterType, selectedNodes);
  }

  updateFilterStatus() {
    let {props, state} = this;
    let {filterType, filterValues} = props;
    let selectedNodes = this.getQueryParamValue(filterType);
    let stringify = JSON.stringify;

    if (selectedNodes == null) {
      selectedNodes = [];
    } else {
      selectedNodes = decodeURIComponent(selectedNodes)
        .split(',')
        .filter(function (filterValue) {
          let existingNode =
            Object.values(filterValues).indexOf(parseInt(filterValue, 10));
          return existingNode !== -1;
        });
    }

    if (stringify(selectedNodes) !== stringify(state.selectedNodes)) {
      this.setState({selectedNodes},
        this.props.handleFilterChange.bind(null, selectedNodes));
    }
  }

  getCountByValue(filterValue) {
    let props = this.props;
    let count = props.countByValue[props.filterValues[filterValue]];

    if (count == null) {
      return 0;
    }

    return count;
  }

  getClearLinkForFilter(filterQueryParamKey) {
    let router = this.context.router;
    let currentPathname = router.getCurrentPathname();
    let query = Object.assign({}, router.getCurrentQuery());
    let params = router.getCurrentParams();

    if (query[filterQueryParamKey] == null ||
        query[filterQueryParamKey].length === 0) {
      return null;
    }

    if (query[filterQueryParamKey] != null) {
      delete query[filterQueryParamKey];
    }

    return (
      <Link
          to={currentPathname}
          query={query}
          params={params}>
        (Clear)
      </Link>
    );
  }

  getFormLabel(filterLabel, filterValue) {
    let badge = null;
    let count = this.getCountByValue(filterValue);

    if (count) {
      badge = (
        <span className="badge text-color-8 inverse text-align-center">
          {count}
        </span>
      );
    }

    return (
      <span className="row row-flex flush flex-align-items-center">
        <span className="label flex-grow">{filterLabel}</span>
        {badge}
      </span>
    );
  }

  getHealthNodes() {
    let {props, state} = this;
    let {filterLabels, filterValues} = props;

    return Object.keys(filterValues).map((filterValue, index) => {
      let value = filterValues[filterValue].toString();
      let checked = state.selectedNodes.indexOf(value) > -1;

      let definition = [{
        checked: checked,
        value: checked,
        fieldType: 'checkbox',
        name: filterValue,
        label:
          this.getFormLabel(filterLabels[filterValue], filterValue),
        labelClass: 'inverse row row-flex flush filter-label'
      }];

      return (
        <Form
          formGroupClass="form-group flush"
          formRowClass=""
          key={index}
          definition={definition}
          onChange={this.handleFormChange.bind(this)} />
      );
    });
  }

  getTitle() {
    let title = this.props.title;

    if (title == null) {
      return null;
    }

    return (
      <h6 className="flush-top flex-grow">{title}</h6>
    );
  }

  render() {
    let props = this.props;

    return (
      <div className="sidebar-filters">
        <div className="row row-flex flex-align-right flush">
          {this.getTitle()}
          {this.getClearLinkForFilter(props.filterType)}
        </div>
        {this.getHealthNodes()}
      </div>
    );
  }
}

SidebarFilter.propTypes = {
  countByValue: React.PropTypes.object.isRequired,
  filterLabels: React.PropTypes.object.isRequired,
  filterType: React.PropTypes.string.isRequired,
  filterValues: React.PropTypes.object.isRequired,
  handleFilterChange: React.PropTypes.func.isRequired,
  title: React.PropTypes.string
};

module.exports = SidebarFilter;
