import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import classNames from "classnames";
import React from "react";
import createReactClass from "create-react-class";
import { Link, routerShape } from "react-router";
import { StoreMixin } from "mesosphere-shared-reactjs";
import { Icon } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";
import CompositeState from "#SRC/js/structs/CompositeState";
import Config from "#SRC/js/config/Config";
import DSLExpression from "#SRC/js/structs/DSLExpression";
import EventTypes from "#SRC/js/constants/EventTypes";
import MesosSummaryStore from "#SRC/js/stores/MesosSummaryStore";
import Page from "#SRC/js/components/Page";
import QueryParamsMixin from "#SRC/js/mixins/QueryParamsMixin";
import SidebarActions from "#SRC/js/events/SidebarActions";

import HostsPageContent from "./nodes-overview/HostsPageContent";
import NodeBreadcrumbs from "../components/NodeBreadcrumbs";
import NodesTableContainer from "./nodes/nodes-table/NodesTableContainer";

const NODES_DISPLAY_LIMIT = 300;

function getMesosHosts(state) {
  const { filterExpression = new DSLExpression(""), filters = [] } = state;
  const states = MesosSummaryStore.get("states");
  const lastState = states.lastSuccessful();
  const nodes = CompositeState.getNodesList();

  let filteredNodes = nodes;
  if (filterExpression && filterExpression.defined) {
    filteredNodes = filterExpression.filter(filters, filteredNodes);
  }

  return {
    filterExpression,
    nodes: filteredNodes,
    refreshRate: Config.getRefreshRate(),
    services: lastState.getServiceList().getItems(),
    totalNodes: nodes.getItems().length,
    totalResources: lastState.getSlaveTotalResources()
  };
}

var DEFAULT_FILTER_OPTIONS = {
  filterExpression: new DSLExpression(""),
  byServiceFilter: null,
  DSLFilteredLength: null
};

var NodesAgents = createReactClass({
  displayName: "NodesAgents",

  mixins: [QueryParamsMixin, StoreMixin],

  statics: {
    routeConfig: {
      label: i18nMark("Nodes"),
      icon: <Icon shape={ProductIcons.ServersInverse} />,
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
    return Object.assign(
      { selectedResource: "cpus", nodesHealth: [] },
      DEFAULT_FILTER_OPTIONS
    );
  },

  componentWillMount() {
    this.mesosHosts = getMesosHosts(this.state);

    this.store_listeners = [
      {
        name: "nodeHealth",
        events: ["success", "error"],
        suppressUpdate: true
      }
    ];
  },

  updateNodeHealth() {
    const nodesHealth = CompositeState.getNodesList()
      .getItems()
      .map(function(node) {
        return node.getHealth();
      });

    this.setState({ nodesHealth });
  },
  onNodeHealthStoreSuccess() {
    this.updateNodeHealth();
  },

  onNodeHealthStoreError() {
    this.updateNodeHealth();
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
    this.mesosHosts = { ...this.mesosHosts, ...getMesosHosts(this.state) };
  },

  resetFilter() {
    const state = { ...DEFAULT_FILTER_OPTIONS };

    this.setState(state);

    this.mesosHosts = { ...this.mesosHosts, ...getMesosHosts(state) };

    this.resetQueryParams([
      "searchString",
      "filterExpression",
      "filterService"
    ]);
  },

  handleSearchStringChange(searchString = "") {
    const params = { ...this.state, searchString };
    this.mesosHosts = { ...this.mesosHosts, ...getMesosHosts(params) };
    this.setState({ searchString });
    this.setQueryParam("searchString", searchString);
  },

  handleByServiceFilterChange(byServiceFilter, filteredLength) {
    this.setState({ DSLFilteredLength: filteredLength });

    if (byServiceFilter === "") {
      byServiceFilter = null;
    }

    const params = { ...this.state, byServiceFilter };
    this.mesosHosts = { ...this.mesosHosts, ...getMesosHosts(params) };
    this.setState({ byServiceFilter });
    this.setQueryParam("filterService", byServiceFilter);
  },

  handleHealthFilterChange(filterExpression, filters) {
    const params = { filterExpression, filters };
    this.mesosHosts = { ...this.mesosHosts, ...getMesosHosts(params) };
    this.setState({ filterExpression, filters });
    this.setQueryParam("filterExpression", filterExpression.value);
  },

  onResourceSelectionChange(selectedResource) {
    if (this.state.selectedResource !== selectedResource) {
      this.setState({ selectedResource });
    }
  },

  getViewTypeRadioButtons() {
    const { filterExpression, byServiceFilter } = this.state;
    const isGridActive = /\/nodes\/agents\/grid\/?/i.test(
      this.props.location.pathname
    );

    var listClassSet = classNames("button button-link", {
      active: !isGridActive
    });

    var gridClassSet = classNames("button button-link", {
      active: isGridActive
    });

    const isFiltering =
      (filterExpression && filterExpression.defined) || !!byServiceFilter;

    const params = isFiltering
      ? "?filterExpression=" + encodeURIComponent(filterExpression.value)
      : "";

    return (
      <div className="flush-bottom">
        <Link className={listClassSet} to={`/nodes/agents${params}`}>
          <Trans render="span" className="invisible">
            List
          </Trans>
          <Icon shape={SystemIcons.List} size={iconSizeXs} />
        </Link>
        <Link className={gridClassSet} to={`/nodes/agents/grid${params}`}>
          <Trans render="span" className="invisible">
            Grid
          </Trans>
          <Icon shape={SystemIcons.Donut} size={iconSizeXs} />
        </Link>
      </div>
    );
  },

  getHostsPageContent() {
    const {
      filterExpression,
      byServiceFilter,
      selectedResource,
      DSLFilteredLength
    } = this.state;
    const data = this.mesosHosts;
    const nodesList = data.nodes || [];
    const filteredLength = byServiceFilter
      ? DSLFilteredLength
      : nodesList.getItems().length;

    const nodesHealth = this.state.nodesHealth;
    const isFiltering =
      (filterExpression && filterExpression.defined) || !!byServiceFilter;

    const isNodesTableContainer =
      this.props.children && this.props.children.type === NodesTableContainer;

    return (
      <Page
        dontScroll={isNodesTableContainer}
        flushBottom={isNodesTableContainer}
      >
        <Page.Header
          breadcrumbs={<NodeBreadcrumbs />}
          tabs={[
            { label: i18nMark("Agents"), routePath: "/nodes/agents" },
            { label: i18nMark("Masters"), routePath: "/nodes/masters" }
          ]}
        />
        <HostsPageContent
          byServiceFilter={byServiceFilter}
          filterItemList={nodesHealth}
          filteredNodeCount={Math.min(filteredLength, NODES_DISPLAY_LIMIT)}
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
          viewTypeRadioButtons={this.getViewTypeRadioButtons()}
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
          <AlertPanelHeader>
            <Trans render="span">No nodes detected</Trans>
          </AlertPanelHeader>
          <Trans render="p" className="flush-bottom">
            There are currently no other nodes in this DC/OS cluster other than
            your DC/OS master node.
          </Trans>
        </AlertPanel>
      </Page>
    );
  },

  render() {
    const statesProcessed = MesosSummaryStore.get("statesProcessed");
    const isEmpty = statesProcessed && this.mesosHosts.totalNodes === 0;

    return isEmpty
      ? this.getEmptyHostsPageContent()
      : this.getHostsPageContent();
  }
});

module.exports = NodesAgents;
