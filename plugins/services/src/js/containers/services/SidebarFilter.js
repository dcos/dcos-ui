import classNames from 'classnames';
import {Form} from 'reactjs-components';
import React from 'react';

import ServiceFilterTypes from '../../constants/ServiceFilterTypes';
import ServiceStatusTypes from '../../constants/ServiceStatusTypes';

const METHODS_TO_BIND = ['handleFormChange'];

class SidebarFilter extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      selectedNodes: []
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

  handleFormChange(model, eventObj) {
    let filterValue = this.props.filterValues[eventObj.fieldValue.name];

    if (eventObj.fieldValue.checked) {
      this.setFilterNode(filterValue);
    } else {
      this.unsetFilterNode(filterValue);
    }
  }

  clearFilters() {
    this.setState({selectedNodes: []});
    this.props.handleFilterChange(this.props.filterType, []);
  }

  setFilterNode(filterValue) {
    let selectedNodes = this.state.selectedNodes.slice(0);

    selectedNodes.push(filterValue);

    this.setState(
      {selectedNodes},
      this.props.handleFilterChange(this.props.filterType, selectedNodes)
    );
  }

  unsetFilterNode(filterValue) {
    let selectedNodes = this.state.selectedNodes.filter(function (node) {
      return node !== filterValue;
    });

    this.setState(
      {selectedNodes},
      this.props.handleFilterChange(this.props.filterType, selectedNodes)
    );
  }

  updateFilterStatus() {
    let {props, state} = this;
    let {filterType, filters} = props;
    let selectedNodes = filters[filterType] || [];
    let stringify = JSON.stringify;

    if (stringify(selectedNodes) !== stringify(state.selectedNodes)) {
      this.setState({selectedNodes});
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

  getClearLinkForFilter() {
    let {filters, filterType} = this.props;

    if (filters[filterType] == null ||
      filters[filterType].length === 0) {
      return null;
    }

    return (
      <a
        className="sidebar-filters-header-clear small flush"
        onClick={() => { this.clearFilters(); }}>
        (Clear)
      </a>
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

  getCheckboxes() {
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
        let checked = selectedNodes.indexOf(value.toString()) > -1
          || selectedNodes.indexOf(value) > -1;

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

  getForm() {
    let definition = [{
      fieldType: 'checkbox',
      name: 'filterNodes',
      value: this.getCheckboxes(),
      writeType: 'input'
    }];

    return (
      <Form
        formGroupClass="form-group flush"
        formRowClass="row"
        definition={definition}
        onChange={this.handleFormChange} />
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
    return (
      <div className="side-list sidebar-filters pod flush-top flush-left">
        <div className="sidebar-filters-header label">
          {this.getTitle()}
          {this.getClearLinkForFilter()}
        </div>
        {this.getForm()}
      </div>
    );
  }
}

SidebarFilter.propTypes = {
  countByValue: React.PropTypes.object.isRequired,
  filters: React.PropTypes.object.isRequired,
  filterLabels: React.PropTypes.object.isRequired,
  filterType: React.PropTypes.string.isRequired,
  filterValues: React.PropTypes.object.isRequired,
  handleFilterChange: React.PropTypes.func.isRequired,
  title: React.PropTypes.string
};

module.exports = SidebarFilter;
