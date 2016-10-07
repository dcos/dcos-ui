import classNames from 'classnames';
import {Form} from 'reactjs-components';
import {Link} from 'react-router';
import mixin from 'reactjs-mixin';
import React from 'react';

import QueryParamsMixin from '../mixins/QueryParamsMixin';
import ServiceFilterTypes from '../constants/ServiceFilterTypes';
import ServiceStatusTypes from '../constants/ServiceStatusTypes';

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
    let filterValue = this.props.filterValues[eventObj.fieldValue.name];

    if (eventObj.fieldValue.checked) {
      this.setFilterNode(filterValue);
    } else {
      this.unsetFilterNode(filterValue);
    }
  }

  setFilterNode(filterValue) {
    let selectedNodes = this.state.selectedNodes.slice(0);

    selectedNodes.push(filterValue);

    this.setQueryParam(this.props.filterType, selectedNodes);
  }

  unsetFilterNode(filterValue) {
    let {state} = this;
    let selectedNodes = [];

    let index = state.selectedNodes
      .indexOf(filterValue.toString());

    if (index !== -1) {
      selectedNodes = state.selectedNodes.slice(0);
      selectedNodes.splice(index, 1);
    }

    this.setQueryParam(this.props.filterType, selectedNodes);
  }

  updateFilterStatus() {
    let {props, state} = this;
    let {filterType, filterValues} = props;
    let selectedNodes = this.getQueryParamObject()[filterType] || [];
    let stringify = JSON.stringify;

    if (!Array.isArray(selectedNodes)) {
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
        this.props.handleFilterChange.bind(null, selectedNodes, filterType));
    }
  }

  getCountByValue(filterValue) {
    let {props} = this;
    let count = props.countByValue[props.filterValues[filterValue]];

    if (count == null) {
      return 0;
    }

    return count;
  }

  getClearLinkForFilter(filterQueryParamKey) {
    let {router} = this.context;
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
        className="sidebar-filters-header-clear small flush"
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
    let filterLabelClasses = classNames(
      'sidebar-filters-item-label',
      {'badge-container': count}
    );
    let filterLabelTextClasses = classNames({'badge-container-text': count});

    if (count) {
      badge = (
        <span className="badge">
          {count}
        </span>
      );
    }

    return (
      <span className={filterLabelClasses}>
        <span className={filterLabelTextClasses}>{filterLabel}</span>
        {badge}
      </span>
    );
  }

  getHealthCheckboxes() {
    let {filterLabels, filterType, filterValues} = this.props;
    let {selectedNodes} = this.state;

    return Object.keys(filterLabels)
      .filter((filterLabel) => {
        let filterValue = filterValues[filterLabel];

        return filterValue != null &&
          !(filterType === ServiceFilterTypes.STATUS &&
          filterValue === ServiceStatusTypes.NA &&
          this.getCountByValue(filterValue) === 0);
      })
      .map((filterLabel) => {
        let value = filterValues[filterLabel];
        let checked = selectedNodes.indexOf(value.toString()) > -1;
        let isActive = this.getCountByValue(filterLabel) > 0;

        let labelClassSet = classNames({
          'filter-active': isActive,
          'filter-inactive': !isActive,
          'filter-checked': checked
        });

        return {
          checked,
          value: checked,
          fieldType: 'checkbox',
          name: filterLabel,
          label: this.getFormLabel(filterLabels[filterLabel], filterLabel),
          labelClass: labelClassSet
        };
      });
  }

  getHealthNodes() {
    let definition = [{
      fieldType: 'checkbox',
      name: 'healthNodes',
      value: this.getHealthCheckboxes(),
      writeType: 'input'
    }];

    return (
      <Form
        formGroupClass="form-group flush"
        formRowClass="row"
        definition={definition}
        onChange={this.handleFormChange.bind(this)} />
    );
  }

  getTitle() {
    let {title} = this.props;

    if (title == null) {
      return null;
    }

    return (
      <h6 className="sidebar-filters-header-title flush">{title}</h6>
    );
  }

  render() {
    let {props} = this;

    return (
      <div className="side-list sidebar-filters hidden-medium hidden-small pod flush-top flush-left">
        <div className="sidebar-filters-header label">
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
