import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Breadcrumbs from '../../components/Breadcrumbs';
import DetailViewHeader from '../../components/DetailViewHeader';
import FilterBar from '../../components/FilterBar';
import FilterHeadline from '../../components/FilterHeadline';
import FilterInputText from '../../components/FilterInputText';
import Icon from '../../components/Icon';
import Loader from '../../components/Loader';
import RequestErrorMsg from '../../components/RequestErrorMsg';
import UnitHealthDropdown from '../../components/UnitHealthDropdown';
import UnitHealthNodesTable from '../../components/UnitHealthNodesTable';
import UnitHealthStore from '../../stores/UnitHealthStore';

const METHODS_TO_BIND = [
  'handleHealthSelection',
  'handleSearchStringChange',
  'resetFilter'
];

class UnitsHealthDetail extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: 'unitHealth',
        events: ['unitSuccess', 'unitError', 'nodesSuccess', 'nodesError'],
        suppressUpdate: true
      }
    ];

    this.state = {
      hasError: false,
      healthFilter: 'all',
      isLoadingUnit: true,
      isLoadingNodes: true,
      searchString: ''
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount();

    UnitHealthStore.fetchUnit(this.props.params.unitID);
    UnitHealthStore.fetchUnitNodes(this.props.params.unitID);
  }

  onUnitHealthStoreUnitSuccess() {
    this.setState({isLoadingUnit: false});
  }

  onUnitHealthStoreUnitError() {
    this.setState({hasError: true});
  }

  onUnitHealthStoreNodesSuccess() {
    this.setState({isLoadingNodes: false});
  }

  onUnitHealthStoreNodeError() {
    this.setState({hasError: true});
  }

  handleHealthSelection(selectedHealth) {
    this.setState({healthFilter: selectedHealth.id});
  }

  handleSearchStringChange(searchString = '') {
    this.setState({searchString});
  }

  getErrorNotice() {
    return (
      <div className="pod">
        <RequestErrorMsg />
      </div>
    );
  }

  getLoadingScreen() {
    return <Loader />;
  }

  getNodesTable(unit, visibleData) {
    return (
      <UnitHealthNodesTable
        nodes={visibleData}
        params={this.props.params} />
    );
  }

  getSubTitle(unit) {
    let healthStatus = unit.getHealth();

    return (
      <ul className="list-inline flush-bottom">
        <li>
          <span className={healthStatus.classNames}>
            {healthStatus.title}
          </span>
        </li>
      </ul>
    );
  }

  getUnit() {
    return UnitHealthStore.getUnit(this.props.params.unitID);
  }

  getVisibleData(data, searchString, healthFilter) {
    return data.filter({ip: searchString, health: healthFilter}).getItems();
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

  render() {
    let {
      healthFilter,
      searchString,
      hasError,
      isLoadingUnit,
      isLoadingNodes
    } = this.state;

    if (hasError) {
      return this.getErrorNotice();
    }

    if (isLoadingUnit || isLoadingNodes) {
      return this.getLoadingScreen();
    }

    let unit = this.getUnit();
    let nodes = UnitHealthStore.getNodes(this.props.params.unitID);
    let visibleData = this.getVisibleData(nodes, searchString, healthFilter);

    return (
      <div className="flex-container-col">
        <Breadcrumbs routes={this.props.routes} params={this.props.params} />
        <DetailViewHeader
          icon={<Icon color="neutral" id="shapes" size="large" />}
          subTitle={this.getSubTitle(unit)}
          title={unit.getTitle()} />
        <FilterHeadline
          currentLength={visibleData.length}
          isFiltering={healthFilter !== 'all' || searchString !== ''}
          name="Health Check"
          onReset={this.resetFilter}
          totalLength={nodes.getItems().length} />
        <FilterBar>
          <div className="form-group flush-bottom">
            <FilterInputText
              className="flush-bottom"
              searchString={searchString}
              handleFilterChange={this.handleSearchStringChange} />
          </div>
          <UnitHealthDropdown
            className="button dropdown-toggle text-align-left"
            dropdownMenuClassName="dropdown-menu"
            initialID="all"
            onHealthSelection={this.handleHealthSelection}
            ref={(ref) => this.healthFilter = ref} />
        </FilterBar>
        <div className="flex-container-col flex-grow no-overflow">
          {this.getNodesTable(unit, visibleData)}
        </div>
      </div>
    );
  }
};

module.exports = UnitsHealthDetail;
