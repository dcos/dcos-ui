import classNames from "classnames";
import React from "react";
import { Link, routerShape } from "react-router";
import { StoreMixin } from "mesosphere-shared-reactjs";

import AlertPanel from "../../../../../src/js/components/AlertPanel";
import AlertPanelHeader
  from "../../../../../src/js/components/AlertPanelHeader";
import CompositeState from "../../../../../src/js/structs/CompositeState";
import Config from "../../../../../src/js/config/Config";
import EventTypes from "../../../../../src/js/constants/EventTypes";
import FilterInputText from "../../../../../src/js/components/FilterInputText";
import HostsPageContent from "./nodes-overview/HostsPageContent";
import Icon from "../../../../../src/js/components/Icon";
import InternalStorageMixin
  from "../../../../../src/js/mixins/InternalStorageMixin";
import MesosSummaryStore from "../../../../../src/js/stores/MesosSummaryStore";
import NodeBreadcrumbs from "../components/NodeBreadcrumbs";
import Page from "../../../../../src/js/components/Page";
import QueryParamsMixin from "../../../../../src/js/mixins/QueryParamsMixin";
import SidebarActions from "../../../../../src/js/events/SidebarActions";
import StringUtil from "../../../../../src/js/utils/StringUtil";

const NODES_DISPLAY_LIMIT = 300;

function getMesosHosts(state) {
  const states = MesosSummaryStore.get("states");
  const lastState = states.lastSuccessful();
  const nodes = CompositeState.getNodesList();

  const { byServiceFilter, healthFilter, searchString } = state;
  const filteredNodes = nodes
    .filter({
      service: byServiceFilter,
      name: searchString,
      health: healthFilter
    })
    .getItems();
  const nodeIDs = filteredNodes.map(function(node) {
    return node.id;
  });

  return {
    nodes: filteredNodes,
    refreshRate: Config.getRefreshRate(),
    services: lastState.getServiceList().getItems(),
    totalHostsResources: states.getResourceStatesForNodeIDs(nodeIDs),
    totalNodes: nodes.getItems().length,
    totalResources: lastState.getSlaveTotalResources()
  };
}

var DEFAULT_FILTER_OPTIONS = {
  byServiceFilter: null,
  healthFilter: "all",
  searchString: ""
};

var NodesOverview = React.createClass({
  displayName: "NodesOverview",

  mixins: [InternalStorageMixin, QueryParamsMixin, StoreMixin],

  statics: {
    routeConfig: {
      label: "Nodes",
      icon: <Icon family="product" id="servers-inverse" />,
      matches: /^\/nodes/
    },
    // Static life cycle method from react router, that will be called
    // 'when a handler is about to render', i.e. on route change:
    // https://github.com/rackt/react-router/
    // blob/master/docs/api/components/RouteHandler.md
    willTransitionTo() {
      SidebarActions.close();
    }
  },

  contextTypes: {
    router: routerShape.isRequired
  },

  getInitialState() {
    return Object.assign({ selectedResource: "cpus" }, DEFAULT_FILTER_OPTIONS);
  },

  componentWillMount() {
    this.internalStorage_set(getMesosHosts(this.state));
    this.internalStorage_update({
      openNodePanel: false,
      openTaskPanel: false
    });

    this.store_listeners = [
      {
        name: "nodeHealth",
        events: ["success", "error"]
      }
    ];
  },

  componentDidMount() {
    MesosSummaryStore.addChangeListener(
      EventTypes.MESOS_SUMMARY_CHANGE,
      this.onMesosStateChange
    );

    MesosSummaryStore.addChangeListener(
      EventTypes.MESOS_SUMMARY_REQUEST_ERROR,
      this.onMesosStateChange
    );

    this.internalStorage_update({
      openNodePanel: this.props.params.nodeID != null,
      openTaskPanel: this.props.params.taskID != null
    });
  },

  componentWillReceiveProps(nextProps) {
    this.internalStorage_update({
      openNodePanel: nextProps.params.nodeID != null,
      openTaskPanel: nextProps.params.taskID != null
    });
  },

  componentWillUnmount() {
    MesosSummaryStore.removeChangeListener(
      EventTypes.MESOS_SUMMARY_CHANGE,
      this.onMesosStateChange
    );

    MesosSummaryStore.removeChangeListener(
      EventTypes.MESOS_SUMMARY_REQUEST_ERROR,
      this.onMesosStateChange
    );
  },

  onMesosStateChange() {
    this.internalStorage_update(getMesosHosts(this.state));
    this.forceUpdate();
  },

  resetFilter() {
    const state = Object.assign({}, DEFAULT_FILTER_OPTIONS);

    this.setState(state);
    this.internalStorage_update(getMesosHosts(state));

    this.resetQueryParams(["searchString", "filterService", "filterHealth"]);
  },

  handleSearchStringChange(searchString = "") {
    var stateChanges = Object.assign({}, this.state, {
      searchString
    });

    this.internalStorage_update(getMesosHosts(stateChanges));
    this.setState({ searchString });
    this.setQueryParam("searchString", searchString);
  },

  handleByServiceFilterChange(byServiceFilter) {
    if (byServiceFilter === "") {
      byServiceFilter = null;
    }

    var stateChanges = Object.assign({}, this.state, {
      byServiceFilter
    });

    this.internalStorage_update(getMesosHosts(stateChanges));
    this.setState({ byServiceFilter });
    this.setQueryParam("filterService", byServiceFilter);
  },

  handleHealthFilterChange(healthFilter) {
    this.internalStorage_update(getMesosHosts({ healthFilter }));
    this.setState({ healthFilter });
    this.setQueryParam("filterHealth", healthFilter);
  },

  onResourceSelectionChange(selectedResource) {
    if (this.state.selectedResource !== selectedResource) {
      this.setState({ selectedResource });
    }
  },

  getButtonContent(filterName, count) {
    const dotClassSet = classNames({
      dot: filterName !== "all",
      danger: filterName === "unhealthy",
      success: filterName === "healthy"
    });

    return (
      <span className="badge-container button-align-content label flush">
        <span className={dotClassSet} />
        <span className="badge-container-text">
          <span>{StringUtil.capitalize(filterName)}</span>
        </span>
        <span className="badge badge-rounded">{count || 0}</span>
      </span>
    );
  },

  getFilterInputText() {
    var isVisible = this.props.location.pathname.endsWith("/nodes/");

    if (!isVisible) {
      return null;
    }

    return (
      <FilterInputText
        className="flush-bottom"
        searchString={this.state.searchString}
        handleFilterChange={this.handleSearchStringChange}
      />
    );
  },

  getViewTypeRadioButtons(resetFilter) {
    const isGridActive = /\/nodes\/grid\/?/i.test(this.props.location.pathname);

    var listClassSet = classNames("button button-stroke", {
      active: !isGridActive
    });

    var gridClassSet = classNames("button button-stroke", {
      active: isGridActive
    });

    return (
      <div className="button-group flush-bottom">
        <Link className={listClassSet} onClick={resetFilter} to="/nodes">
          List
        </Link>
        <Link className={gridClassSet} onClick={resetFilter} to="/nodes/grid">
          Grid
        </Link>
      </div>
    );
  },

  getHostsPageContent() {
    const {
      byServiceFilter,
      healthFilter,
      searchString,
      selectedResource
    } = this.state;
    var data = this.internalStorage_get();
    const nodes = data.nodes || [];
    const nodesList = nodes.slice(0, NODES_DISPLAY_LIMIT);
    const nodesHealth = CompositeState.getNodesList()
      .getItems()
      .map(function(node) {
        return node.getHealth();
      });
    const isFiltering =
      byServiceFilter !== null || healthFilter !== "all" || searchString !== "";

    return (
      <Page>
        <Page.Header breadcrumbs={<NodeBreadcrumbs />} />
        <HostsPageContent
          byServiceFilter={byServiceFilter}
          filterButtonContent={this.getButtonContent}
          filterInputText={this.getFilterInputText()}
          filterItemList={nodesHealth}
          filteredNodeCount={nodesList.length}
          handleFilterChange={this.handleByServiceFilterChange}
          hosts={nodesList}
          isFiltering={isFiltering}
          nodeCount={data.nodes.length}
          onFilterChange={this.handleHealthFilterChange}
          onResetFilter={this.resetFilter}
          onResourceSelectionChange={this.onResourceSelectionChange}
          refreshRate={data.refreshRate}
          selectedFilter={healthFilter}
          selectedResource={selectedResource}
          services={data.services}
          totalHostsResources={data.totalHostsResources}
          totalNodeCount={data.totalNodes}
          totalResources={data.totalResources}
          viewTypeRadioButtons={this.getViewTypeRadioButtons(this.resetFilter)}
        >
          {this.props.children}
        </HostsPageContent>
      </Page>
    );
  },

  getEmptyHostsPageContent() {
    return (
      <Page>
        <AlertPanel>
          <AlertPanelHeader>No nodes detected</AlertPanelHeader>
          <p className="flush-bottom">
            There a currently no other nodes in your datacenter other than your DC/OS master node.
          </p>
        </AlertPanel>
      </Page>
    );
  },

  getContents(isEmpty) {
    if (isEmpty) {
      return this.getEmptyHostsPageContent();
    } else {
      return this.getHostsPageContent();
    }
  },

  render() {
    var data = this.internalStorage_get();
    const statesProcessed = MesosSummaryStore.get("statesProcessed");
    var isEmpty = statesProcessed && data.totalNodes === 0;

    return this.getContents(isEmpty);
  }
});

module.exports = NodesOverview;
