import mixin from "reactjs-mixin";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { routerShape } from "react-router";
import { StoreMixin } from "mesosphere-shared-reactjs";

import CompositeState from "../../../../../../src/js/structs/CompositeState";
import Loader from "../../../../../../src/js/components/Loader";
import MesosSummaryStore
  from "../../../../../../src/js/stores/MesosSummaryStore";
import NodeBreadcrumbs from "../../components/NodeBreadcrumbs";
import NodeHealthStore from "../../stores/NodeHealthStore";
import Page from "../../../../../../src/js/components/Page";
import ResourceChart
  from "../../../../../../src/js/components/charts/ResourceChart";
import TabsMixin from "../../../../../../src/js/mixins/TabsMixin";
import RouterUtil from "../../../../../../src/js/utils/RouterUtil";

class NodeDetailPage extends mixin(TabsMixin, StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      { name: "summary", events: ["success"], suppressUpdate: false },
      { name: "state", events: ["success"], suppressUpdate: false },
      {
        name: "nodeHealth",
        events: ["nodeSuccess", "nodeError", "unitsSuccess", "unitsError"],
        suppressUpdate: false
      }
    ];

    this.tabs_tabs = {
      "/nodes/:nodeID/tasks": "Tasks",
      "/nodes/:nodeID/health": "Health",
      "/nodes/:nodeID/details": "Details"
    };

    this.state = {
      mesosStateLoaded: false,
      node: null
    };
  }

  componentWillMount() {
    super.componentWillMount(...arguments);

    const node = this.getNode(this.props);
    if (node) {
      this.setState({ node });
      NodeHealthStore.fetchNodeUnits(node.hostname);
    }

    // TODO: DCOS-7871 Refactor the TabsMixin to generalize this solution:
    const routes = this.props.routes;
    const currentRoute = routes.find(function(route) {
      return route.component === NodeDetailPage;
    });
    if (currentRoute != null) {
      this.tabs_tabs = currentRoute.childRoutes
        .filter(function({ isTab }) {
          return !!isTab;
        })
        .reduce(function(tabs, { path, title }) {
          tabs[path] = title;

          return tabs;
        }, this.tabs_tabs);
    }
    this.updateCurrentTab();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params.nodeID !== nextProps.params.nodeID) {
      const node = this.getNode(nextProps);
      this.setState({ node });
    }

    this.updateCurrentTab(nextProps);
  }

  componentWillUpdate() {
    super.componentWillUpdate(...arguments);

    const node = this.getNode(this.props);
    if (node && !this.state.node) {
      this.setState({ node });
      NodeHealthStore.fetchNodeUnits(node.hostname);
    }
  }

  onStateStoreSuccess() {
    if (this.state.mesosStateLoaded === false) {
      this.setState({ mesosStateLoaded: true });
    }
  }

  updateCurrentTab(nextProps) {
    const { routes } = nextProps || this.props;
    const currentTab = RouterUtil.reconstructPathFromRoutes(routes);
    if (currentTab != null) {
      this.setState({ currentTab });
    }
  }

  getNode(props) {
    return CompositeState.getNodesList()
      .filter({ ids: [props.params.nodeID] })
      .last();
  }

  getLoadingScreen() {
    return (
      <Page>
        <Page.Header breadcrumbs={<NodeBreadcrumbs />} />
        <Loader />
      </Page>
    );
  }

  getNotFound(nodeID) {
    return (
      <Page>
        <Page.Header breadcrumbs={<NodeBreadcrumbs />} />
        <div className="pod text-align-center">
          <h3 className="flush-top text-align-center">
            Error finding node
          </h3>
          <p className="flush">
            {`Did not find a node by the id "${nodeID}"`}
          </p>
        </div>
      </Page>
    );
  }

  getCharts(itemType, item) {
    if (!item) {
      return null;
    }

    const states = MesosSummaryStore.get("states");
    const resources = states[`getResourceStatesFor${itemType}IDs`]([item.id]);

    return (
      <div className="row">
        <ResourceChart resourceName="cpus" resources={resources} />
        <ResourceChart resourceName="mem" resources={resources} />
        <ResourceChart resourceName="disk" resources={resources} />
      </div>
    );
  }

  render() {
    if (
      !MesosSummaryStore.get("statesProcessed") ||
      !this.state.mesosStateLoaded
    ) {
      return this.getLoadingScreen();
    }

    const { node } = this.state;
    const { nodeID } = this.props.params;

    if (!node) {
      return this.getNotFound(nodeID);
    }

    const { currentTab } = this.state;
    const tabs = [
      {
        label: "Tasks",
        callback: () => {
          this.context.router.push(`/nodes/${nodeID}/tasks`);
        },
        isActive: currentTab === "/nodes/:nodeID/tasks"
      },
      {
        label: "Health",
        callback: () => {
          this.context.router.push(`/nodes/${nodeID}/health`);
        },
        isActive: currentTab === "/nodes/:nodeID/health"
      },
      {
        label: "Details",
        callback: () => {
          this.context.router.push(`/nodes/${nodeID}/details`);
        },
        isActive: currentTab === "/nodes/:nodeID/details"
      }
    ];

    return (
      <Page>
        <Page.Header
          breadcrumbs={<NodeBreadcrumbs nodeID={nodeID} />}
          tabs={tabs}
        />
        {React.cloneElement(this.props.children, { node })}
      </Page>
    );
  }
}

NodeDetailPage.contextTypes = {
  router: routerShape
};

module.exports = NodeDetailPage;
