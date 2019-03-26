import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import mixin from "reactjs-mixin";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { routerShape } from "react-router";
import { StoreMixin } from "mesosphere-shared-reactjs";

import CompositeState from "#SRC/js/structs/CompositeState";
import Loader from "#SRC/js/components/Loader";
import MesosSummaryStore from "#SRC/js/stores/MesosSummaryStore";
import Page from "#SRC/js/components/Page";
import TabsMixin from "#SRC/js/mixins/TabsMixin";
import RouterUtil from "#SRC/js/utils/RouterUtil";

import NodeBreadcrumbs from "../../components/NodeBreadcrumbs";
import NodeHealthStore from "../../stores/NodeHealthStore";

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
      "/nodes/:nodeID/tasks": i18nMark("Tasks"),
      "/nodes/:nodeID/health": i18nMark("Health"),
      "/nodes/:nodeID/details": i18nMark("Details")
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
          <Trans render="h3" className="flush-top text-align-center">
            Error finding node
          </Trans>
          <Trans render="p" className="flush">
            Did not find a node by the id "{nodeID}"
          </Trans>
        </div>
      </Page>
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
        label: i18nMark("Tasks"),
        callback: () => {
          this.context.router.push(`/nodes/${nodeID}/tasks`);
        },
        isActive: currentTab === "/nodes/:nodeID/tasks"
      },
      {
        label: i18nMark("Health"),
        callback: () => {
          this.context.router.push(`/nodes/${nodeID}/health`);
        },
        isActive: currentTab === "/nodes/:nodeID/health"
      },
      {
        label: i18nMark("Details"),
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
