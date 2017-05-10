import mixin from "reactjs-mixin";
import React, { PropTypes } from "react";
import { routerShape } from "react-router";

import Page from "#SRC/js/components/Page";
import RouterUtil from "#SRC/js/utils/RouterUtil";
import StringUtil from "#SRC/js/utils/StringUtil";
import TabsMixin from "#SRC/js/mixins/TabsMixin";
import UserActions from "#SRC/js/constants/UserActions";
import { isSDKService } from "#SRC/js/utils/ServiceUtil";

import Pod from "../../structs/Pod";
import PodHeader from "./PodHeader";
import Service from "../../structs/Service";
import ServiceActionDisabledModal
  from "../../components/modals/ServiceActionDisabledModal";
import ServiceActionLabels from "../../constants/ServiceActionLabels";
import ServiceBreadcrumbs from "../../components/ServiceBreadcrumbs";
import ServiceModals from "../../components/modals/ServiceModals";
import ServiceTree from "../../structs/ServiceTree";
import {
  DELETE,
  EDIT,
  OPEN,
  RESTART,
  RESUME,
  SCALE,
  SUSPEND
} from "../../constants/ServiceActionItem";

const METHODS_TO_BIND = [
  "handleActionDisabledModalOpen",
  "handleActionDisabledModalClose"
];

class PodDetail extends mixin(TabsMixin) {
  constructor() {
    super(...arguments);

    this.tabs_tabs = {
      "/services/overview/:id/tasks": "Instances",
      "/services/overview/:id/configuration": "Configuration",
      "/services/overview/:id/debug": "Debug"
    };

    this.state = {
      actionDisabledID: null,
      actionDisabledModalOpen: false,
      currentTab: Object.keys(this.tabs_tabs).shift()
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    super.componentWillMount(...arguments);
    this.updateCurrentTab();
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(...arguments);
    this.updateCurrentTab(nextProps);
  }

  updateCurrentTab(props = this.props) {
    const { routes } = props;
    const currentTab = RouterUtil.reconstructPathFromRoutes(routes);
    if (currentTab != null) {
      this.setState({ currentTab });
    }
  }

  onActionsItemSelection(actionID) {
    const { pod } = this.props;
    const isGroup = pod instanceof ServiceTree;
    let containsSDKService = false;

    if (isGroup) {
      containsSDKService =
        pod.findItem(function(item) {
          return item instanceof Service && isSDKService(item);
        }) != null;
    }

    // We still want to support the `open` action to display the web view
    if (actionID !== OPEN && (containsSDKService || isSDKService(pod))) {
      this.handleActionDisabledModalOpen(actionID);
    } else {
      this.handleServiceAction(actionID);
    }
  }

  handleServiceAction(actionID) {
    const { modalHandlers, router } = this.context;
    const { pod } = this.props;

    switch (actionID) {
      case EDIT:
        router.push(
          `/services/detail/${encodeURIComponent(pod.getId())}/edit/`
        );
        break;
      case SCALE:
        modalHandlers.scaleService({ service: pod });
        break;
      case OPEN:
        modalHandlers.openServiceUI({ service: pod });
        break;
      case RESTART:
        modalHandlers.restartService({ service: pod });
        break;
      case RESUME:
        modalHandlers.resumeService({ service: pod });
        break;
      case SUSPEND:
        modalHandlers.suspendService({ service: pod });
        break;
      case DELETE:
        modalHandlers.deleteService({ service: pod });
        break;
    }
  }

  handleActionDisabledModalOpen(actionDisabledID) {
    this.setState({ actionDisabledModalOpen: true, actionDisabledID });
  }

  handleActionDisabledModalClose() {
    this.setState({ actionDisabledModalOpen: false, actionDisabledID: null });
  }

  getActions() {
    const { pod } = this.props;
    const instanceCount = pod.getInstancesCount();

    const actions = [];

    if (
      pod instanceof Service &&
      pod.getWebURL() != null &&
      pod.getWebURL() !== ""
    ) {
      actions.push({
        label: this.props.intl.formatMessage({
          id: ServiceActionLabels.open
        }),
        onItemSelect: this.onActionsItemSelection.bind(this, OPEN)
      });
    }

    actions.push({
      label: "Edit",
      onItemSelect: this.onActionsItemSelection.bind(this, EDIT)
    });

    if (instanceCount > 0) {
      actions.push({
        label: "Restart",
        onItemSelect: this.onActionsItemSelection.bind(this, RESTART)
      });
    }
    if (!pod.getLabels().MARATHON_SINGLE_INSTANCE_APP) {
      actions.push({
        label: "Scale",
        onItemSelect: this.onActionsItemSelection.bind(this, SCALE)
      });
    }

    if (instanceCount > 0) {
      actions.push({
        label: "Suspend",
        onItemSelect: this.onActionsItemSelection.bind(this, SUSPEND)
      });
    }

    if (instanceCount === 0) {
      actions.push({
        label: "Resume",
        onItemSelect: this.onActionsItemSelection.bind(this, RESUME)
      });
    }

    actions.push({
      className: "text-danger",
      label: StringUtil.capitalize(UserActions.DELETE),
      onItemSelect: this.onActionsItemSelection.bind(this, DELETE)
    });

    return actions;
  }

  getTabs() {
    const { pod: { id } } = this.props;
    const routePrefix = `/services/detail/${encodeURIComponent(id)}`;

    return [
      { label: "Instances", routePath: `${routePrefix}/tasks` },
      { label: "Configuration", routePath: `${routePrefix}/configuration` },
      { label: "Debug", routePath: `${routePrefix}/debug` }
    ];
  }

  render() {
    const { children, pod } = this.props;
    const { actionDisabledModalOpen, actionDisabledID } = this.state;

    const breadcrumbs = <ServiceBreadcrumbs serviceID={pod.id} />;

    // TODO (DCOS_OSS-1038): Move cloned props to route parameters
    const clonedProps = { service: pod };
    const clonedChildren = React.Children.map(children, function(child) {
      // Only add props to children that are not ServiceModals
      if (child.type === ServiceModals) {
        return child;
      }

      return React.cloneElement(child, clonedProps);
    });

    return (
      <Page>
        <Page.Header
          actions={this.getActions()}
          breadcrumbs={breadcrumbs}
          tabs={this.getTabs()}
        >
          <PodHeader
            onDestroy={this.handleActionDestroy}
            onEdit={this.handleActionEdit}
            onScale={this.handleActionScale}
            onSuspend={this.handleActionSuspend}
            pod={pod}
            tabs={this.getTabs()}
          />
        </Page.Header>
        {clonedChildren}
        <ServiceActionDisabledModal
          actionID={actionDisabledID}
          open={actionDisabledModalOpen}
          onClose={this.handleActionDisabledModalClose}
          service={pod}
        />
      </Page>
    );
  }
}

PodDetail.contextTypes = {
  modalHandlers: PropTypes.shape({
    scaleService: PropTypes.func,
    suspendService: PropTypes.func,
    deleteService: PropTypes.func
  }).isRequired,
  router: routerShape
};

PodDetail.propTypes = {
  children: PropTypes.node,
  pod: React.PropTypes.instanceOf(Pod)
};

module.exports = PodDetail;
