import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import mixin from "reactjs-mixin";
import React from "react";
import { routerShape } from "react-router";

import Loader from "#SRC/js/components/Loader";
import MesosSummaryStore from "#SRC/js/stores/MesosSummaryStore";
import { withNode } from "#SRC/js/stores/MesosSummaryFetchers";
import Page from "#SRC/js/components/Page";
import RouterUtil from "#SRC/js/utils/RouterUtil";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import TabsMixin from "#SRC/js/mixins/TabsMixin";
import { defaultNetworkErrorHandler } from "#SRC/js/utils/DefaultErrorUtil";

import { Status, actionAllowed, StatusAction } from "../../types/Status";
import DrainNodeModal from "../../components/modals/DrainNodeModal";
import DeactivateNodeConfirm from "../../components/modals/DeactivateNodeConfirm";
import NodeMaintenanceActions from "../../actions/NodeMaintenanceActions";
import NodeBreadcrumbs from "../../components/NodeBreadcrumbs";
import NodeHealthStore from "../../stores/NodeHealthStore";

class NodeDetailPage extends mixin(TabsMixin, StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      { name: "summary", events: ["success"], suppressUpdate: true },
      { name: "state", events: ["success"], suppressUpdate: true },
      {
        name: "nodeHealth",
        events: ["nodeSuccess", "nodeError", "unitsSuccess", "unitsError"],
        suppressUpdate: true
      }
    ];

    this.tabs_tabs = {
      "/nodes/:nodeID/tasks": i18nMark("Tasks"),
      "/nodes/:nodeID/health": i18nMark("Health"),
      "/nodes/:nodeID/details": i18nMark("Details")
    };

    this.state = {
      mesosStateLoaded: false,
      selectedNodeToDrain: null,
      selectedNodeToDeactivate: null
    };

    this.handleNodeAction = this.handleNodeAction.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  UNSAFE_componentWillMount() {
    const { node } = this.props;
    if (node) {
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

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.updateCurrentTab(nextProps);
  }

  UNSAFE_componentWillUpdate() {
    const { node } = this.props;
    if (node) {
      NodeHealthStore.fetchNodeUnits(node.hostname);
    }
  }

  onStateStoreSuccess() {
    if (this.state.mesosStateLoaded === false) {
      this.setState({ mesosStateLoaded: true });
    }
  }

  onSummaryStoreSuccess() {
    this.setState({
      summaryStatesProcessed: MesosSummaryStore.get("statesProcessed"),
      summaryStates: MesosSummaryStore.get("states")
    });
  }

  updateCurrentTab(nextProps) {
    const { routes } = nextProps || this.props;
    const currentTab = RouterUtil.reconstructPathFromRoutes(routes);
    if (currentTab != null) {
      this.setState({ currentTab });
    }
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

  getActions() {
    const actions = [];
    const { node } = this.props;
    const status = Status.fromNode(node);

    if (actionAllowed(StatusAction.DRAIN, status)) {
      actions.push({
        label: "Drain",
        onItemSelect: this.handleNodeAction.bind(this, StatusAction.DRAIN)
      });
    }

    if (actionAllowed(StatusAction.DEACTIVATE, status)) {
      actions.push({
        label: "Deactivate",
        onItemSelect: this.handleNodeAction.bind(this, StatusAction.DEACTIVATE)
      });
    }

    if (actionAllowed(StatusAction.REACTIVATE, status)) {
      actions.push({
        label: "Reactivate",
        onItemSelect: this.handleNodeAction.bind(this, StatusAction.REACTIVATE)
      });
    }

    return actions;
  }

  handleNodeAction(action) {
    const { node } = this.props;

    // TODO: Status#StatusAction enum
    if (action === "drain") {
      this.setState({ selectedNodeToDrain: node });
    } else if (action === "deactivate") {
      this.setState({ selectedNodeToDeactivate: node });
    } else if (action === "reactivate") {
      NodeMaintenanceActions.reactivateNode(node, {
        onSuccess: () => {},
        onError: defaultNetworkErrorHandler
      });
    }
  }

  handleCloseModal() {
    this.setState({
      selectedNodeToDeactivate: null,
      selectedNodeToDrain: null
    });
  }

  render() {
    if (!this.state.summaryStatesProcessed || !this.state.mesosStateLoaded) {
      return this.getLoadingScreen();
    }

    const { node } = this.props;
    const { nodeID } = this.props.params;

    if (!node) {
      return this.getNotFound(nodeID);
    }

    const {
      currentTab,
      selectedNodeToDrain,
      selectedNodeToDeactivate
    } = this.state;

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
          actions={this.getActions()}
          breadcrumbs={<NodeBreadcrumbs node={node} />}
          tabs={tabs}
        />
        {React.cloneElement(this.props.children, { node })}
        <DrainNodeModal
          open={selectedNodeToDrain !== null}
          node={selectedNodeToDrain}
          onClose={this.handleCloseModal}
        />
        <DeactivateNodeConfirm
          open={selectedNodeToDeactivate !== null}
          node={selectedNodeToDeactivate}
          onClose={this.handleCloseModal}
        />
      </Page>
    );
  }
}

NodeDetailPage.contextTypes = {
  router: routerShape
};

module.exports = withNode(NodeDetailPage);
