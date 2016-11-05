import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {routerShape} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Breadcrumbs from '../../../../../../src/js/components/Breadcrumbs';
import CompositeState from '../../../../../../src/js/structs/CompositeState';
import DetailViewHeader from '../../../../../../src/js/components/DetailViewHeader';
import Loader from '../../../../../../src/js/components/Loader';
import MesosSummaryStore from '../../../../../../src/js/stores/MesosSummaryStore';
import NodeHealthStore from '../../stores/NodeHealthStore';
import ResourceChart from '../../../../../../src/js/components/charts/ResourceChart';
import StringUtil from '../../../../../../src/js/utils/StringUtil';
import TabsMixin from '../../../../../../src/js/mixins/TabsMixin';
import RouterUtil from '../../../../../../src/js/utils/RouterUtil';

class NodeDetailPage extends mixin(TabsMixin, StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {name: 'summary', events: ['success'], suppressUpdate: false},
      {name: 'state', events: ['success'], suppressUpdate: false},
      {
        name: 'nodeHealth',
        events: ['nodeSuccess', 'nodeError', 'unitsSuccess', 'unitsError'],
        suppressUpdate: false
      }
    ];

    this.tabs_tabs = {
      '/nodes/:nodeID/tasks': 'Tasks',
      '/nodes/:nodeID/health': 'Health',
      '/nodes/:nodeID/details': 'Details'
    };

    this.state = {node: null};
  }

  componentWillMount() {
    super.componentWillMount(...arguments);

    let node = this.getNode(this.props);
    if (node) {
      this.setState({node});
      NodeHealthStore.fetchNodeUnits(node.hostname);
    }

    // TODO: DCOS-7871 Refactor the TabsMixin to generalize this solution:
    let routes = this.props.routes;
    let currentRoute = routes.find(function (route) {
      return route.component === NodeDetailPage;
    });
    if (currentRoute != null) {
      this.tabs_tabs = currentRoute.childRoutes.filter(function ({isTab}) {
        return !!isTab;
      }).reduce(function (tabs, {path, title}) {
        tabs[path] = title;
        return tabs;
      }, this.tabs_tabs);
    }
    this.updateCurrentTab();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params.nodeID !== nextProps.params.nodeID) {
      let node = this.getNode(nextProps);
      this.setState({node});
    }

    this.updateCurrentTab(nextProps);
  }

  componentWillUpdate() {
    super.componentWillUpdate(...arguments);

    let node = this.getNode(this.props);
    if (node && !this.state.node) {
      this.setState({node});
      NodeHealthStore.fetchNodeUnits(node.hostname);
    }
  }

  updateCurrentTab(nextProps) {
    let {routes} = nextProps || this.props;
    let currentTab = RouterUtil.reconstructPathFromRoutes(routes);
    if (currentTab != null) {
      this.setState({currentTab});
    }
  }

  getNode(props) {
    return CompositeState.getNodesList().filter(
      {ids: [props.params.nodeID]}
    ).last();
  }

  getLoadingScreen() {
    return <Loader />;
  }

  getNotFound(nodeID) {
    return (
      <div className="pod text-align-center">
        <h3 className="flush-top text-align-center">
          Error finding node
        </h3>
        <p className="flush">
          {`Did not find a node by the id "${nodeID}"`}
        </p>
      </div>
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

  getDetailViewHeader(node) {
    // Hide when viewing task, volume or unit details
    let {taskID, volumeID, unitID} = this.props.params;
    if (taskID || volumeID || unitID) {
      return null;
    }

    return (
      <div>
        <Breadcrumbs routes={this.props.routes} params={this.props.params} />
        <DetailViewHeader
          navigationTabs={this.getNavigation()}
          subTitle={this.getSubHeader(node)}
          title={node.hostname}>
          <div className="pod pod-short flush-right flush-bottom flush-left">
            {this.getCharts('Node', node)}
          </div>
        </DetailViewHeader>
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

  getNavigation() {
    return (
      <ul className="menu-tabbed">
        {this.tabs_getRoutedTabs(this.props)}
      </ul>
    );
  }

  render() {
    if (!MesosSummaryStore.get('statesProcessed')) {
      return this.getLoadingScreen();
    }

    let {node} = this.state;
    let {nodeID} = this.props.params;

    if (!node) {
      return this.getNotFound(nodeID);
    }

    return (
      <div>
        {this.getDetailViewHeader(node)}
        {this.props.children && React.cloneElement(this.props.children, { node })}
      </div>
    );
  }
}

NodeDetailPage.contextTypes = {
  router: routerShape
};

module.exports = NodeDetailPage;
