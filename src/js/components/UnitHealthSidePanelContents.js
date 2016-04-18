/*eslint-disable no-unused-vars*/
import React from 'react';
/*eslint-enable no-unused-vars*/

import FilterHeadline from '../components/FilterHeadline';
import FilterInputText from '../components/FilterInputText';
import RequestErrorMsg from './RequestErrorMsg';
import SidePanelContents from './SidePanelContents';
import UnitHealthDropdown from '../components/UnitHealthDropdown';
import UnitHealthNodesTable from '../components/UnitHealthNodesTable';
import UnitHealthStore from '../stores/UnitHealthStore';

const METHODS_TO_BIND = [
  'handleHealthSelection',
  'handleSearchStringChange',
  'resetFilter'
];

module.exports = class UnitHealthSidePanelContents extends SidePanelContents {
  constructor() {
    super();

    this.internalStorage_set({renderTable: false});

    this.store_listeners = [
      {
        name: 'unitHealth',
        events: ['unitSuccess', 'unitError', 'nodesSuccess', 'nodesError']
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

    UnitHealthStore.fetchUnit(this.props.itemID);
    UnitHealthStore.fetchUnitNodes(this.props.itemID);

    this.internalStorage_update({renderTable: true});
  }

  handleHealthSelection(selectedHealth) {
    this.setState({healthFilter: selectedHealth.id});
  }

  handleSearchStringChange(searchString) {
    this.setState({searchString});
  }

  getUnitHeader(unit) {
    let imageTag = (
      <div className="side-panel-icon icon icon-large icon-image-container
        icon-app-container">
        <img src="./img/services/icon-service-default-medium@2x.png" />
      </div>
    );

    return (
      <div className="side-panel-content-header-details flex-box
        flex-box-align-vertical-center">
        {imageTag}
        <div>
          <h1 className="side-panel-content-header-label flush">
            {unit.getTitle()}
          </h1>
          <div>
            {this.getSubHeader(unit)}
          </div>
        </div>
      </div>
    );
  }

  getErrorNotice() {
    return (
      <div className="container container-pod">
        <RequestErrorMsg />
      </div>
    );
  }

  getNodesTable(renderTable, unit, visibleData) {
    if (!renderTable) {
      return null;
    }

    return (
      <UnitHealthNodesTable
        nodes={visibleData}
        unit={unit}
        itemID={this.props.itemID}
        parentRouter={this.props.parentRouter} />
    );
  }

  getSubHeader(unit) {
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
    return UnitHealthStore.getUnit(this.props.itemID);
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
    let {healthFilter, searchString} = this.state;

    let unit = this.getUnit();
    let nodes = UnitHealthStore.getNodes(this.props.itemID);
    let visibleData = this.getVisibleData(nodes, searchString, healthFilter);
    let renderTable = this.internalStorage_get().renderTable;

    return (
      <div className="flex-container-col">
        <div className="side-panel-section side-panel-content-header container container-pod container-fluid container-pod-divider-bottom container-pod-divider-bottom-align-right flush-bottom">
          <div className="container-pod container-pod-short flush-top">
            {this.getUnitHeader(unit)}
          </div>
        </div>
        <div className="side-panel-tab-content side-panel-section container
          container-fluid container-pod container-pod-short container-fluid
          flex-container-col flex-grow no-overflow">
          <div className="flex-container-col flex-grow no-overflow">
            <FilterHeadline
              currentLength={visibleData.length}
              inverseStyle={false}
              name={"Health Checks"}
              onReset={this.resetFilter}
              totalLength={nodes.getItems().length} />
            <ul className="list list-unstyled list-inline flush-bottom">
              <li>
                <FilterInputText
                  searchString={this.state.searchString}
                  handleFilterChange={this.handleSearchStringChange}
                  inverseStyle={false} />
              </li>
              <li>
                <UnitHealthDropdown
                  initialID="all"
                  onHealthSelection={this.handleHealthSelection} />
              </li>
            </ul>
            {this.getNodesTable(renderTable, unit, visibleData)}
          </div>
        </div>
      </div>
    );
  }
};
