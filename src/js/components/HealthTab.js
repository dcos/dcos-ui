import React from 'react';
import {Table} from 'reactjs-components';

import FilterHeadline from '../components/FilterHeadline';
import FilterInputText from '../components/FilterInputText';
import ResourceTableUtil from '../utils/ResourceTableUtil';
import StringUtil from '../utils/StringUtil';
import TableUtil from '../utils/TableUtil';
import UnitHealthDropdown from '../components/UnitHealthDropdown';
import UnitHealthUtil from '../utils/UnitHealthUtil';
import Util from '../utils/Util';

const METHODS_TO_BIND = [
  'handleHealthSelection',
  'handleSearchStringChange',
  'renderHealth',
  'renderUnitHealthCheck',
  'resetFilter'
];

class HealthTab extends React.Component {
  constructor() {
    super();

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
    let router = this.props.parentRouter;
    let healthCheckName = `${unit.getTitle()} Health Check`;
    let currentPath = router.getCurrentRoutes();
    let path = `${Util.last(currentPath).name}-health`;
    let params = Object.assign({}, router.getCurrentParams());

    params.unitNodeID = this.props.node.get('host_ip');
    params.unitID = unit.get('id');

    return (
      <a
        className="emphasize clickable text-overflow"
        onClick={() => { this.props.parentRouter.transitionTo(path, params); }}
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
          inverseStyle={false}
          name={"Health Checks"}
          onReset={this.resetFilter}
          totalLength={units.getItems().length} />
        <ul className="list list-unstyled list-inline flush-bottom">
          <li>
            <FilterInputText
              searchString={searchString}
              handleFilterChange={this.handleSearchStringChange}
              inverseStyle={false} />
          </li>
          <li>
            <UnitHealthDropdown
              initialID="all"
              onHealthSelection={this.handleHealthSelection} />
          </li>
        </ul>
        <Table
          className="table table-borderless-outer
            table-borderless-inner-columns flush-bottom"
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
