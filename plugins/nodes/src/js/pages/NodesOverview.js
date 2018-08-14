import classNames from "classnames";
import React from "react";
import { Link, routerShape } from "react-router";
import { StoreMixin } from "mesosphere-shared-reactjs";

import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";
import CompositeState from "#SRC/js/structs/CompositeState";
import Config from "#SRC/js/config/Config";
import DSLExpression from "#SRC/js/structs/DSLExpression";
import DSLFilterList from "#SRC/js/structs/DSLFilterList";
import EventTypes from "#SRC/js/constants/EventTypes";
import FilterInputText from "#SRC/js/components/FilterInputText";
import Icon from "#SRC/js/components/Icon";
import InternalStorageMixin from "#SRC/js/mixins/InternalStorageMixin";
import MesosSummaryStore from "#SRC/js/stores/MesosSummaryStore";
import Page from "#SRC/js/components/Page";
import QueryParamsMixin from "#SRC/js/mixins/QueryParamsMixin";
import SidebarActions from "#SRC/js/events/SidebarActions";
import StringUtil from "#SRC/js/utils/StringUtil";

import { Badge } from "@dcos/ui-kit";
import HostsPageContent from "./nodes-overview/HostsPageContent";
import NodeBreadcrumbs from "../components/NodeBreadcrumbs";
import NodesTableContainer from "./nodes/nodes-table/NodesTableContainer";

const NODES_DISPLAY_LIMIT = 300;

function getMesosHosts(state) {
  const {
    filterExpression = new DSLExpression(""),
    filters = new DSLFilterList([])
  } = state;
  const states = MesosSummaryStore.get("states");
  const lastState = states.lastSuccessful();
  const nodes = CompositeState.getNodesList();

  let filteredNodes = nodes;
  if (filterExpression && filterExpression.defined) {
    filteredNodes = filterExpression.filter(filters, filteredNodes);
  }
  const nodeIDs = filteredNodes.getItems().map(function(node) {
    return node.id;
  });

  return {
    filterExpression,
    nodes: filteredNodes,
    refreshRate: Config.getRefreshRate(),
    services: lastState.getServiceList().getItems(),
    totalHostsResources: states.getResourceStatesForNodeIDs(nodeIDs),
    totalNodes: nodes.getItems().length,
    totalResources: lastState.getSlaveTotalResources()
  };
}

var DEFAULT_FILTER_OPTIONS = {
  filterExpression: new DSLExpression("")
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

    this.resetQueryParams(["searchString", "filterExpression"]);
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

  handleHealthFilterChange(filterExpression, filters) {
    this.internalStorage_update(getMesosHosts({ filterExpression, filters }));
    this.setState({ filterExpression, filters });
    this.setQueryParam("filterExpression", filterExpression.value);
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
        <Badge>{count || 0}</Badge>
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

    var listClassSet = classNames("button button-outline", {
      active: !isGridActive
    });

    var gridClassSet = classNames("button button-outline", {
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
    const { filterExpression, byServiceFilter, selectedResource } = this.state;
    var data = this.internalStorage_get();
    const nodesList = data.nodes || [];
    const nodesHealth = CompositeState.getNodesList()
      .getItems()
      .map(function(node) {
        return node.getHealth();
      });
    const isFiltering = filterExpression && filterExpression.defined;

    const isNodesTableContainer =
      this.props.children && this.props.children.type === NodesTableContainer;

    return (
      <Page
        dontScroll={isNodesTableContainer}
        flushBottom={isNodesTableContainer}
      >
        <Page.Header breadcrumbs={<NodeBreadcrumbs />} />
        <HostsPageContent
          byServiceFilter={byServiceFilter}
          filterButtonContent={this.getButtonContent}
          filterInputText={this.getFilterInputText()}
          filterItemList={nodesHealth}
          filteredNodeCount={Math.min(
            nodesList.getItems().length,
            NODES_DISPLAY_LIMIT
          )}
          handleFilterChange={this.handleByServiceFilterChange}
          hosts={nodesList}
          allHosts={CompositeState.getNodesList()}
          location={this.props.location}
          isFiltering={isFiltering}
          onFilterChange={this.handleHealthFilterChange}
          onResetFilter={this.resetFilter}
          onResourceSelectionChange={this.onResourceSelectionChange}
          selectedResource={selectedResource}
          services={data.services}
          totalNodeCount={data.totalNodes}
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
            There a currently no other nodes in your datacenter other than your
            DC/OS master node.
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
