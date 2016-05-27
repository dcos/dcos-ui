import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Breadcrumbs from '../../components/Breadcrumbs';
import FilterBar from '../../components/FilterBar';
import FilterHeadline from '../../components/FilterHeadline';
import FilterInputText from '../../components/FilterInputText';
import PageHeader from '../../components/PageHeader';
import RequestErrorMsg from '../../components/RequestErrorMsg';
import UnitHealthDropdown from '../../components/UnitHealthDropdown';
import UnitHealthNodesTable from '../../components/UnitHealthNodesTable';
import UnitHealthStore from '../../stores/UnitHealthStore';

const METHODS_TO_BIND = [
  'handleHealthSelection',
  'handleSearchStringChange',
  'resetFilter'
];

const FLAGS = {
  UNIT_LOADED: parseInt('1', 2),
  NODES_LOADED: parseInt('10', 2)
};

class UnitsHealthDetail extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: 'unitHealth',
        events: ['unitSuccess', 'unitError', 'nodesSuccess', 'nodesError']
      }
    ];

    this.state = {
      hasError: false,
      healthFilter: 'all',
      isLoading: FLAGS.UNIT_LOADED | FLAGS.NODES_LOADED,
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
    let isLoading = this.state.isLoading & ~FLAGS.UNIT_LOADED;
    this.setState({isLoading});
  }

  onUnitHealthStoreUnitError() {
    this.setState({hasError: true});
  }

  onUnitHealthStoreNodesSuccess() {
    let isLoading = this.state.isLoading & ~FLAGS.NODES_LOADED;
    this.setState({isLoading});
  }

  onUnitHealthStoreNodeError() {
    this.setState({hasError: true});
  }

  handleHealthSelection(selectedHealth) {
    this.setState({healthFilter: selectedHealth.id});
  }

  handleSearchStringChange(searchString) {
    this.setState({searchString});
  }

  getErrorNotice() {
    return (
      <div className="container container-pod">
        <RequestErrorMsg />
      </div>
    );
  }

  getLoadingScreen() {
    return (
      <div className="container-pod text-align-center vertical-center inverse">
        <div className="row">
          <div className="ball-scale">
            <div />
          </div>
        </div>
      </div>
    );
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
    this.setState({
      searchString: '',
      healthFilter: 'all'
    });
  }

  render() {
    let {healthFilter, searchString, hasError, isLoading} = this.state;

    if (hasError) {
      return this.getErrorNotice();
    }

    if (isLoading) {
      return this.getLoadingScreen();
    }

    let unit = this.getUnit();
    let nodes = UnitHealthStore.getNodes(this.props.params.unitID);
    let visibleData = this.getVisibleData(nodes, searchString, healthFilter);

    return (
      <div className="flex-container-col">
        <Breadcrumbs />
        <PageHeader
          icon={<img src="./img/services/icon-service-default-medium@2x.png" />}
          iconClassName="icon-app-container"
          subTitle={this.getSubTitle(unit)}
          title={unit.getTitle()} />
        <FilterHeadline
          currentLength={visibleData.length}
          inverseStyle={true}
          name={"Health Checks"}
          onReset={this.resetFilter}
          totalLength={nodes.getItems().length} />
        <FilterBar>
          <div className="form-group flush-bottom">
            <FilterInputText
              className="flush-bottom"
              searchString={searchString}
              handleFilterChange={this.handleSearchStringChange}
              inverseStyle={true} />
          </div>
          <UnitHealthDropdown
            className="button dropdown-toggle text-align-left button-inverse"
            dropdownMenuClassName="dropdown-menu inverse"
            initialID="all"
            onHealthSelection={this.handleHealthSelection} />
        </FilterBar>
        <div className="flex-container-col flex-grow no-overflow">
          {this.getNodesTable(unit, visibleData)}
        </div>
      </div>
    );
  }
};

module.exports = UnitsHealthDetail;
