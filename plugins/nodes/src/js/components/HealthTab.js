import PureRender from 'react-addons-pure-render-mixin';
import React from 'react';
import {ResourceTableUtil} from 'foundation-ui';
import {Table} from 'reactjs-components';

import FilterBar from '../../../../../src/js/components/FilterBar';
import FilterHeadline from '../../../../../src/js/components/FilterHeadline';
import FilterInputText from '../../../../../src/js/components/FilterInputText';
import StringUtil from '../../../../../src/js/utils/StringUtil';
import TableUtil from '../../../../../src/js/utils/TableUtil';
import UnitHealthDropdown from '../../../../../src/js/components/UnitHealthDropdown';
import UnitHealthUtil from '../../../../../src/js/utils/UnitHealthUtil';

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

    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);
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

  handleSearchStringChange(searchString = '') {
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
    if (this.healthFilter !== null && this.healthFilter.dropdown !== null) {
      this.healthFilter.setDropdownValue('all');
    }

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
    let healthCheckName = unit.getTitle();
    let router = this.props.parentRouter;
    let params = Object.assign({}, router.getCurrentParams());
    params.unitNodeID = this.props.node.get('hostname');
    params.unitID = unit.get('id');

    return (
      <a
        className="emphasize clickable text-overflow"
        onClick={() => { this.props.parentRouter.transitionTo('/nodes/:nodeID/health/:unitNodeID/:unitID', params); }}
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
          isFiltering={healthFilter !== 'all' || searchString !== ''}
          name={"Health Check"}
          onReset={this.resetFilter}
          totalLength={units.getItems().length} />
        <FilterBar>
          <FilterInputText
            className="flush-bottom"
            handleFilterChange={this.handleSearchStringChange}
            searchString={searchString} />
          <UnitHealthDropdown
            className="button dropdown-toggle text-align-left"
            dropdownMenuClassName="dropdown-menu"
            initialID="all"
            onHealthSelection={this.handleHealthSelection}
            ref={(ref) => this.healthFilter = ref} />
        </FilterBar>
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
