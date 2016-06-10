import classNames from 'classnames';
import {Link} from 'react-router';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';
import {Table} from 'reactjs-components';

import FilterBar from '../../components/FilterBar';
import FilterHeadline from '../../components/FilterHeadline';
import FilterButtons from '../../components/FilterButtons';
import FilterInputText from '../../components/FilterInputText';
import ResourceTableUtil from '../../utils/ResourceTableUtil';
import StringUtil from '../../utils/StringUtil';
import TableUtil from '../../utils/TableUtil';
import UnitHealthStore from '../../stores/UnitHealthStore';
import UnitHealthUtil from '../../utils/UnitHealthUtil';

const METHODS_TO_BIND = [
  'handleHealthFilterChange',
  'handleSearchStringChange',
  'renderUnit',
  'renderHealth',
  'resetFilter'
];

class UnitsHealthTab extends mixin(StoreMixin) {

  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: 'unitHealth',
        events: ['success', 'error']
      }
    ];

    this.state = {
      healthFilter: 'all',
      searchString: ''
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    }, this);
  }

  componentDidMount() {
    super.componentDidMount();
    UnitHealthStore.fetchUnits();
  }

  handleSearchStringChange(searchString) {
    this.setState({searchString});
  }

  renderUnit(prop, unit) {
    return (
      <div className="text-overflow">
        <Link to="system-overview-units-unit-nodes-detail"
          params={{unitID: unit.get('id')}}
          className="headline">
          {unit.getTitle()}
        </Link>
      </div>
    );
  }

  renderHealth(prop, unit) {
    let health = unit.getHealth();

    return (
      <span className={health.classNames}>
        {StringUtil.capitalize(health.title)}
      </span>
    );
  }

  getButtonContent(filterName, count) {
    let dotClassSet = classNames({
      'dot': filterName !== 'all',
      'danger': filterName === 'unhealthy',
      'success': filterName === 'healthy'
    });

    return (
      <span className="button-align-content">
        <span className={dotClassSet}></span>
        <span className="label">{StringUtil.capitalize(filterName)}</span>
        <span className="badge">{count || 0}</span>
      </span>
    );
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{width: '75%'}} />
        <col style={{width: '25%'}} />
      </colgroup>
    );
  }

  getColumns() {
    let classNameFn = ResourceTableUtil.getClassName;
    let sortFunction = UnitHealthUtil.getHealthSortFunction;

    return [
      {
        className: classNameFn,
        headerClassName: classNameFn,
        heading: ResourceTableUtil.renderHeading({name: 'NAME'}),
        prop: 'name',
        render: this.renderUnit,
        sortable: true,
        sortFunction
      },
      {
        className: classNameFn,
        headerClassName: classNameFn,
        heading: ResourceTableUtil.renderHeading({health: 'HEALTH'}),
        prop: 'health',
        render: this.renderHealth,
        sortable: true,
        sortFunction
      }
    ];
  }

  handleHealthFilterChange(healthFilter) {
    this.setState({healthFilter});
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

  render() {
    let data = UnitHealthStore.getUnits();
    let dataItems = data.getItems();
    let {healthFilter, searchString} = this.state;
    let visibleData = this.getVisibleData(data, searchString, healthFilter);
    let dataHealth = dataItems.map(function (unit) {
      return unit.getHealth();
    });

    return (
      <div className="flex-container-col">
        <div className="units-health-table-header">
          <FilterHeadline
            inverseStyle={true}
            onReset={this.resetFilter}
            name="Component"
            currentLength={visibleData.length}
            totalLength={dataItems.length} />
          <FilterBar rightAlignLastNChildren={1}>
            <FilterInputText
              className="flush-bottom"
              searchString={searchString}
              handleFilterChange={this.handleSearchStringChange}
              inverseStyle={true} />
            <FilterButtons
              renderButtonContent={this.getButtonContent}
              filters={['all', 'healthy', 'unhealthy']}
              filterByKey="title"
              onFilterChange={this.handleHealthFilterChange}
              inverseStyle={true}
              itemList={dataHealth}
              selectedFilter={healthFilter} />
            <a href={UnitHealthStore.getDownloadURL()}
              className="button button-primary" target="_blank">
              Download Snapshot
            </a>
          </FilterBar>
        </div>
        <div className="page-content-fill flex-grow flex-container-col">
          <Table
            className="table inverse table-borderless-outer
              table-borderless-inner-columns flush-bottom"
            columns={this.getColumns()}
            colGroup={this.getColGroup()}
            containerSelector=".gm-scroll-view"
            data={visibleData}
            itemHeight={TableUtil.getRowHeight()}
            sortBy={{prop: 'health', order: 'asc'}}
            />
        </div>
      </div>
    );
  }
}

module.exports = UnitsHealthTab;
