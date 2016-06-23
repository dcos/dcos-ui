import {Link} from 'react-router';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {RouteHandler} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Breadcrumbs from '../../components/Breadcrumbs';
import CompositeState from '../../structs/CompositeState';
import DateUtil from '../../utils/DateUtil';
import DescriptionList from '../../components/DescriptionList';
import HealthTab from '../../components/HealthTab';
import Icon from '../../components/Icon';
import InternalStorageMixin from '../../mixins/InternalStorageMixin';
import MesosSummaryStore from '../../stores/MesosSummaryStore';
import MesosStateStore from '../../stores/MesosStateStore';
import NodeHealthStore from '../../stores/NodeHealthStore';
import Page from '../../components/Page';
import PageHeader from '../../components/PageHeader';
import StringUtil from '../../utils/StringUtil';
import ResourceChart from '../../components/charts/ResourceChart';
import TabsMixin from '../../mixins/TabsMixin';
import TaskView from '../../components/TaskView';

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
  }

  componentWillMount() {
    super.componentWillMount(...arguments);

    let node = this.getNode();
    if (node) {
      this.internalStorage_update({node});
      NodeHealthStore.fetchNodeUnits(node.hostname);
    }
  }

  componentWillUpdate() {
    super.componentWillUpdate(...arguments);

    let node = this.getNode();
    if (node && !this.internalStorage_get().node) {
      this.internalStorage_update({node})
      NodeHealthStore.fetchNodeUnits(node.hostname);
    }
  }

  getBreadcrumbs(nodeID) {
    return (
      <h5 className="inverse">
        <Link className="headline emphasize" to="nodes">
          Nodes
        </Link>
        <Icon family="small" id="caret-right" size="small" />
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

    return (
      <div className="row">
        <ResourceChart
          resourceName="cpus"
          resources={resources} />
        <ResourceChart
          resourceName="mem"
          resources={resources} />
        <ResourceChart
          resourceName="disk"
          resources={resources} />
      </div>
    );
  }

  getNode() {
    return CompositeState.getNodesList().filter(
      {ids: [this.props.params.nodeID]}
    ).last();
  }

  getNotFound(nodeID) {
    return (
      <div className="container container-fluid container-pod text-align-center">
        <h3 className="flush-top text-align-center">
          Error finding node
        </h3>
        <p className="flush">
          {`Did not find a node by the id "${nodeID}"`}
        </p>
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

    return (
      <div className="container container-fluid flush">
        <TaskView
          inverseStyle={true}
          tasks={tasks}
          parentRouter={this.context.router}
          nodeID={nodeID} />
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
          className="container container-fluid flush container-pod container-pod-super-short flush-top"
          hash={headerValueMapping} />
        <DescriptionList
          className="container container-fluid flush container-pod container-pod-super-short flush-top"
          hash={node.attributes}
          headline="Attributes" />
      </div>
    );
  }

  render() {
    let node = this.internalStorage_get().node;
    let {params} = this.props;

    // TODO (DCOS-7580): Clean up NodeDetailPage routed and unrouted views
    if (!node) {
      return (
        <Page title="Nodes">
          {this.getNotFound(params.nodeID)}
        </Page>
      );
    }

    if (params.taskID || params.volumeID) {
      // Make sure to grow when logs are displayed
      let routes = this.context.router.getCurrentRoutes();

      return (
        <Page
          dontScroll={routes[routes.length - 1].dontScroll}
          title="Nodes">
          <RouteHandler />
        </Page>
      );
    }

    let tabs = (
      <ul className="tabs list-inline flush-bottom container-pod
        container-pod-short-top inverse">
        {this.tabs_getUnroutedTabs()}
      </ul>
    );

    return (
      <Page title="Nodes">
        <Breadcrumbs />
        <PageHeader
          navigationTabs={tabs}
          subTitle={this.getSubHeader(node)}
          title={node.hostname}>
          <div className="container-pod container-pod-short flush-bottom">
            {this.getCharts('Node', node)}
          </div>
        </PageHeader>
        {this.tabs_getTabView()}
      </Page>
    );
  }
}

NodeDetailPage.contextTypes = {
  router: React.PropTypes.func
};

module.exports = NodeDetailPage;
