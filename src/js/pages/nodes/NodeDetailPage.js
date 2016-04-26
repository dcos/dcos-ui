import _ from 'underscore';
import {Link} from 'react-router';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {RouteHandler} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import BarChart from '../../components/charts/BarChart';
import Chart from '../../components/charts/Chart';
import CompositeState from '../../structs/CompositeState';
import Config from '../../config/Config';
import DateUtil from '../../utils/DateUtil';
import DescriptionList from '../../components/DescriptionList';
import HealthTab from '../../components/HealthTab';
import InternalStorageMixin from '../../mixins/InternalStorageMixin';
import MesosSummaryStore from '../../stores/MesosSummaryStore';
import MesosStateStore from '../../stores/MesosStateStore';
import NodeHealthStore from '../../stores/NodeHealthStore';
import Page from '../../components/Page';
import ResourceTypes from '../../constants/ResourceTypes';
import SidePanelContents from '../../components/SidePanelContents';
import SidePanels from '../../components/SidePanels';
import StringUtil from '../../utils/StringUtil';
import TabsMixin from '../../mixins/TabsMixin';
import TaskView from '../../components/TaskView';
import Units from '../../utils/Units';

// number to fit design of width vs. height ratio
const WIDTH_HEIGHT_RATIO = 4.5;

const METHODS_TO_BIND = [
];

class NodeDetailPage extends mixin(InternalStorageMixin, TabsMixin, StoreMixin) {
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

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    }, this);
  }

  componentDidMount() {
    super.componentDidMount(...arguments);

    this.mountedAt = Date.now();

    let node = this.getNode();
    this.internalStorage_update({node});

    if (node) {
      NodeHealthStore.fetchNodeUnits(node.hostname);
    }
  }

  componentWillUpdate() {
    super.componentWillUpdate(...arguments);

    if (!this.internalStorage_get().node) {
      this.internalStorage_update({node: this.getNode()})
    }
  }

  getBasicInfo(node) {
    return (
      <div className="detail-page-header">
        <h1 className="inverse flush">
          {node.hostname}
        </h1>
        {this.getSubHeader(node)}
      </div>
    );
  }

  getBreadcrumbs(nodeID) {
    return (
      <h5 className="inverse">
        <Link className="headline emphasize" to="nodes">
          Nodes
        </Link>
        <span style={{'margin': '0 15px'}}>
          ›
        </span>
        {nodeID}
      </h5>
    );
  }

  getCharts(itemType, item) {
    if (!item) {
      return null;
    }

    let states = MesosSummaryStore.get('states');
    let resources = states[`getResourceStatesFor${itemType}IDs`]([item.id]);

    let charts = [
      this.getResourceChart('cpus', resources),
      this.getResourceChart('mem', resources),
      this.getResourceChart('disk', resources)
    ];

    return charts.map(function (chart, i) {
      return (
        <div key={i} className="column-12 column-mini-4">
          <div className="row chart">
            {chart}
          </div>
        </div>
      );
    });
  }

  getLoadingScreen() {
    return (
      <div className="container container-fluid container-pod text-align-center
        vertical-center inverse">
        <div className="row">
          <div className="ball-scale">
            <div />
          </div>
        </div>
      </div>
    );
  }

  getNode() {
    return CompositeState.getNodesList().filter(
      {ids: [this.props.params.nodeID]}
    ).last();
  }

  getNotFound() {
    return (
      <div className="container container-fluid container-pod text-align-center">
        <h3 className="flush-top text-align-center">
          Error finding node
        </h3>
        <p className="flush">
          {`Did not find a node by the id "${this.props.params.nodeID}"`}
        </p>
      </div>
    );
  }

  getResourceChart(resource, totalResources) {
    let colorIndex = ResourceTypes[resource].colorIndex;
    let resourceLabel = ResourceTypes[resource].label;
    let resourceData = [{
      name: 'Alloc',
      colorIndex: colorIndex,
      values: totalResources[resource]
    }];
    let resourceValue = Units.formatResource(
      resource, _.last(totalResources[resource]).value
    );
    let resourceIconClasses = `icon icon-sprite icon-sprite-medium
      icon-sprite-medium-color icon-resources-${resourceLabel.toLowerCase()}`;

    let axisConfiguration = {
      x: {hideMatch: /^0$/},
      y: {showPercentage: false, suffix: '%'}
    };

    let maxY = 5;
    totalResources[resource].forEach(function (resourceTotal) {
      if (resourceTotal.percentage > maxY) {
        maxY = resourceTotal.percentage;
      }
    });

    maxY *= 1.5; // Multiply by 150%
    maxY /= 10; // Divide so that we can round to nearest tenth
    maxY = Math.round(maxY); // Round
    maxY *= 10; // Multiply so that we get a percentage number between 0-100
    maxY = Math.min(100, maxY); // Don't let it be greater than 100%

    return (
      <div key={resource} className="column-12
        flex-box-align-vertical-center
        container-pod
        container-pod-super-short
        flush-top">
        <div className="media-object-spacing-wrapper media-object-offset">
          <div className="media-object media-object-align-middle">
            <div className="media-object-item">
              <i className={resourceIconClasses}></i>
            </div>
            <div className="media-object-item">
              <h4 className="flush-top flush-bottom inverse">
                {resourceValue}
              </h4>
              <span className={`side-panel-resource-label
                  text-color-${colorIndex}`}>
                {resourceLabel.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <Chart calcHeight={function (w) { return w / WIDTH_HEIGHT_RATIO; }}
          delayRender={true}>
          <BarChart
            axisConfiguration={axisConfiguration}
            data={resourceData}
            inverseStyle={true}
            margin={{top: 0, left: 43, right: 10, bottom: 40}}
            maxY={maxY}
            refreshRate={Config.getRefreshRate()}
            ticksY={3}
            xGridLines={0}
            y="percentage" />
        </Chart>
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

  renderHealthTabView() {
    let node = this.internalStorage_get().node;
    let units = NodeHealthStore.getUnits(node.hostname);

    return (
      <div className="container container-fluid flush">
        <HealthTab
          node={node}
          units={units}
          parentRouter={this.context.router} />
      </div>
    );
  }

  renderTasksTabView() {
    let nodeID = this.props.params.nodeID;
    let tasks = MesosStateStore.getTasksFromNodeID(this.props.params.nodeID);

    let contents = this.getLoadingScreen();

    let timeSinceMount = (Date.now() - this.mountedAt) / 1000;
    if (timeSinceMount >= SidePanelContents.animationLengthSeconds) {
      contents = (
        <TaskView
          inverseStyle={true}
          tasks={tasks}
          parentRouter={this.context.router}
          nodeID={nodeID} />
      );
    }

    return (
      <div className="container container-fluid flush">
        {contents}
      </div>
    );
  }

  renderDetailsTabView() {
    let nodeID = this.props.params.nodeID;
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
      <div className="container container-fluid flush">
        <DescriptionList
          className="container container-fluid flush"
          hash={headerValueMapping} />
        <DescriptionList
          className="container container-fluid container-pod flush flush-top flush-bottom"
          hash={node.attributes}
          headline="Attributes" />
      </div>
    );
  }

  render() {
    let node = this.internalStorage_get().node;

    if (!node) {
      return (
        <Page title="Nodes">
          {this.getNotFound()}
        </Page>
      );
    }

    return (
      <Page title="Nodes">
        <div className="container container-fluid flush">
          {this.getBreadcrumbs(node.get('hostname'))}
        </div>
        <div>
          <div className="container container-fluid container-pod container-pod-short container-pod-super-short-top flush">
            {this.getBasicInfo(node)}
            <div className="container-pod container-pod-short">
              <div className="row">
                {this.getCharts('Node', node)}
              </div>
            </div>
            <div className="container-pod container-pod-divider-bottom container-pod-divider-inverse container-pod-divider-bottom-align-right flush-top flush-bottom">
              <ul className="tabs list-inline flush-bottom inverse">
                {this.tabs_getUnroutedTabs()}
              </ul>
            </div>
          </div>
          {this.tabs_getTabView()}
          <SidePanels
            params={this.props.params}
            openedPage="nodes" />
          <RouteHandler />
        </div>
      </Page>
    );
  }
}

NodeDetailPage.contextTypes = {
  router: React.PropTypes.func
};

NodeDetailPage.propTypes = {
  nodeID: React.PropTypes.string
};

module.exports = NodeDetailPage;
