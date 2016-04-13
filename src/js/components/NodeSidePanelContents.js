/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import CompositeState from '../structs/CompositeState';
import DateUtil from '../utils/DateUtil';
import DescriptionList from './DescriptionList';
import HealthTab from '../components/HealthTab';
import MesosSummaryStore from '../stores/MesosSummaryStore';
import MesosStateStore from '../stores/MesosStateStore';
import NodeHealthStore from '../stores/NodeHealthStore';
import SidePanelContents from './SidePanelContents';
import StringUtil from '../utils/StringUtil';
import TaskView from './TaskView';

class NodeSidePanelContents extends SidePanelContents {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {name: 'summary', events: ['success']},
      {name: 'state', events: ['success']},
      {name: 'nodeHealth', events: ['nodeSuccess', 'nodeError', 'unitsSuccess', 'unitsError']}
    ];

    this.tabs_tabs = {
      tasks: 'Tasks',
      health: 'Health',
      details: 'Details'
    };

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift()
    };
  }

  componentDidMount() {
    super.componentDidMount(...arguments);

    let node = this.getNode();
    this.internalStorage_update({node});

    if (node) {
      NodeHealthStore.fetchNodeUnits(node.hostname);
    }
  }

  getBasicInfo(node) {
    return (
      <div className="side-panel-content-header">
        <h1 className="side-panel-content-header-label flush">
          {node.hostname}
        </h1>
        {this.getSubHeader(node)}
      </div>
    );
  }

  getSubHeader(node) {
    let activeTasksCount = node.sumTaskTypesByState('active');
    let activeTasksSubHeader = StringUtil.pluralize('Task', activeTasksCount);
    let healthStatus = node.getHealth();

    return (
      <ul className="list-inline flush-bottom">
        <li>
          <span className={healthStatus.classNames}>
            {healthStatus.title}
          </span>
        </li>
        <li>
          {`${activeTasksCount} Active ${activeTasksSubHeader}`}
        </li>
      </ul>
    );
  }

  getNode() {
    return CompositeState.getNodesList().filter(
      {ids: [this.props.itemID]}
    ).last();
  }

  renderHealthTabView() {
    let node = this.internalStorage_get().node;
    let units = NodeHealthStore.getUnits(node.hostname);

    return (
      <div className="side-panel-tab-content side-panel-section container container-fluid container-pod container-pod-short container-fluid flex-container-col flush-bottom flex-grow">
        <HealthTab
          node={node}
          units={units}
          parentRouter={this.props.parentRouter} />
      </div>
    );
  }

  renderTasksTabView() {
    let tasks = MesosStateStore.getTasksFromNodeID(this.props.itemID);

    let contents = this.getLoadingScreen();

    let timeSinceMount = (Date.now() - this.mountedAt) / 1000;
    if (timeSinceMount >= SidePanelContents.animationLengthSeconds) {
      contents = <TaskView tasks={tasks} parentRouter={this.props.parentRouter} />;
    }

    return (
      <div className="side-panel-tab-content side-panel-section container container-fluid container-pod container-pod-short container-fluid flex-container-col flush-bottom flex-grow">
        {contents}
      </div>
    );
  }

  renderDetailsTabView() {
    let nodeID = this.props.itemID;
    let last = MesosSummaryStore.get('states').lastSuccessful();
    let node = last.getNodesList().filter({ids: [nodeID]}).last();

    if (node == null) {
      return null;
    }

    let headerValueMapping = {
      ID: node.id,
      Active: StringUtil.capitalize(node.active.toString().toLowerCase()),
      Registered: DateUtil.msToDateStr(
        node.registered_time.toFixed(3) * 1000
      ),
      'Master Version': MesosStateStore.get('lastMesosState').version
    };

    return (
      <div className="container-fluid container-pod container-pod-short flush-top">
        <DescriptionList
          className="container container-fluid container-pod container-pod-short flush-bottom"
          hash={headerValueMapping} />
        <DescriptionList
          className="container container-fluid container-pod container-pod-short flush-bottom"
          hash={node.attributes}
          headline="Attributes" />
      </div>
    );
  }

  render() {
    let node = this.internalStorage_get().node;

    if (!node) {
      return this.getNotFound('node');
    }

    return (
      <div className="flex-container-col">
        <div className="side-panel-section side-panel-content-header container container-pod container-fluid container-pod-divider-bottom container-pod-divider-bottom-align-right flush-bottom">
          {this.getBasicInfo(node)}
          <div className="side-panel-content-header-charts container-pod container-pod-short">
            <div className="row">
              {this.getCharts('Node', node)}
            </div>
          </div>
          <ul className="tabs list-inline flush-bottom">
            {this.tabs_getUnroutedTabs()}
          </ul>
        </div>
        {this.tabs_getTabView()}
      </div>
    );
  }
}

module.exports = NodeSidePanelContents;
