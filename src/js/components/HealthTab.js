import React from 'react';
import {Table} from 'reactjs-components';

import FilterBar from './FilterBar';
import FilterHeadline from './FilterHeadline';
import FilterInputText from './FilterInputText';
import ResourceTableUtil from '../utils/ResourceTableUtil';
import StringUtil from '../utils/StringUtil';
import TableUtil from '../utils/TableUtil';
import UnitHealthDropdown from './UnitHealthDropdown';
import UnitHealthUtil from '../utils/UnitHealthUtil';

const METHODS_TO_BIND = [
  'handleHealthSelection',
  'handleSearchStringChange',
  'renderHealth',
  'renderUnitHealthCheck',
  'resetFilter'
];

class HealthTab extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      healthFilter: 'all',
      searchString: ''
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleHealthSelection(selectedHealth) {
    this.setState({healthFilter: selectedHealth.id});
  }

  handleSearchStringChange(searchString) {
    this.setState({searchString});
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{width: '25%'}} />
        <col />
      </colgroup>
    );
  }

  getColumns() {
    let classNameFn = ResourceTableUtil.getClassName;
    let headings = ResourceTableUtil.renderHeading({
      health: 'HEALTH',
      id: 'HEALTH CHECK NAME',
      role: 'ROLE'
    });
    let sortFunction = UnitHealthUtil.getHealthSortFunction;

    return [
      {
        className: classNameFn,
        headerClassName: classNameFn,
        heading: headings,
        prop: 'health',
        render: this.renderHealth,
        sortable: true,
        sortFunction
      },
      {
        className: classNameFn,
        headerClassName: classNameFn,
        heading: headings,
        prop: 'id',
        render: this.renderUnitHealthCheck,
        sortable: true,
        sortFunction
      }
    ];
  }

  getVisibleData(data, searchString, healthFilter) {
    return data.filter({title: searchString, health: healthFilter}).getItems();
  }

  resetFilter() {
    this.setState({
      searchString: '',
      healthFilter: 'all'
    });
  }

  renderHealth(prop, node) {
    let health = node.getHealth();

    return (
      <span className={health.classNames}>
        {StringUtil.capitalize(health.title)}
      </span>
    );
  }

  renderUnitHealthCheck(prop, unit) {
    let healthCheckName = `${unit.getTitle()} Health Check`;
    let router = this.props.parentRouter;
    let params = Object.assign({}, router.getCurrentParams());
    params.unitNodeID = this.props.node.get('hostname');
    params.unitID = unit.get('id');

    return (
      <a
        className="emphasize clickable text-overflow"
        onClick={() => { this.props.parentRouter.transitionTo('node-detail-health', params); }}
        title={healthCheckName}>
        {healthCheckName}
      </a>
    );
  }

  render() {
    let {healthFilter, searchString} = this.state;
    let units = this.props.units;
    let visibleData = this.getVisibleData(units, searchString, healthFilter);

    return (
      <div>
        <FilterHeadline
          currentLength={visibleData.length}
          inverseStyle={true}
          name={"Health Check"}
          onReset={this.resetFilter}
          totalLength={units.getItems().length} />
        <FilterBar>
          <FilterInputText
            className="flush-bottom"
            searchString={searchString}
            handleFilterChange={this.handleSearchStringChange}
            inverseStyle={true} />
          <UnitHealthDropdown
            initialID="all"
            className="button dropdown-toggle text-align-left button-inverse"
            dropdownMenuClassName="dropdown-menu inverse"
            onHealthSelection={this.handleHealthSelection} />
        </FilterBar>
        <Table
          className="table table-borderless-outer
            table-borderless-inner-columns flush-bottom inverse"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          containerSelector=".gm-scroll-view"
          data={visibleData}
          itemHeight={TableUtil.getRowHeight()}
          sortBy={{prop: 'health', order: 'asc'}}
          />
      </div>
    );
  }
}

HealthTab.propTypes = {
  node: React.PropTypes.object.isRequired,
  units: React.PropTypes.object.isRequired
};

module.exports = HealthTab;
