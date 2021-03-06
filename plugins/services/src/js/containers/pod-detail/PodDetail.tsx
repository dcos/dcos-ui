import { i18nMark } from "@lingui/react";
import PropTypes from "prop-types";
import * as React from "react";
import { routerShape } from "react-router";
import { Hooks } from "PluginSDK";

import Page from "#SRC/js/components/Page";
import { isSDKService } from "#PLUGINS/services/src/js/utils/ServiceUtil";

import Pod from "../../structs/Pod";
import PodHeader from "./PodHeader";
import Service from "../../structs/Service";
import ServiceActionDisabledModal from "../../components/modals/ServiceActionDisabledModal";
import ServiceActionLabels from "../../constants/ServiceActionLabels";
import ServiceBreadcrumbs from "../../components/ServiceBreadcrumbs";
import ServiceModals from "../../components/modals/ServiceModals";
import ServiceTree from "../../structs/ServiceTree";
import { ServiceActionItem } from "../../constants/ServiceActionItem";

const DELETE = ServiceActionItem.DELETE;
const EDIT = ServiceActionItem.EDIT;
const OPEN = ServiceActionItem.OPEN;
const RESUME = ServiceActionItem.RESUME;
const SCALE = ServiceActionItem.SCALE;
const STOP = ServiceActionItem.STOP;
const RESET_DELAYED = ServiceActionItem.RESET_DELAYED;

class PodDetail extends React.Component<{ pod }> {
  static propTypes = {
    children: PropTypes.node,
    pod: PropTypes.instanceOf(Pod),
  };

  state = { actionDisabledID: null, actionDisabledModalOpen: false };

  onActionsItemSelection(actionID) {
    const { pod } = this.props;
    const isGroup = pod instanceof ServiceTree;
    let containsSDKService = false;

    if (isGroup) {
      containsSDKService =
        pod.findItem((item) => item instanceof Service && isSDKService(item)) !=
        null;
    }

    // We still want to support the `open` action to display the web view
    if (
      actionID !== DELETE &&
      (containsSDKService || isSDKService(pod)) &&
      !Hooks.applyFilter(
        "isEnabledSDKAction",
        actionID === EDIT || actionID === OPEN,
        actionID
      )
    ) {
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
      case RESET_DELAYED:
        modalHandlers.resetDelayedService({ service: pod });
        break;
      case OPEN:
        modalHandlers.openServiceUI({ service: pod });
        break;
      case RESUME:
        modalHandlers.resumeService({ service: pod });
        break;
      case STOP:
        modalHandlers.stopService({ service: pod });
        break;
      case DELETE:
        modalHandlers.deleteService({ service: pod });
        break;
    }
  }
  handleActionDisabledModalOpen = (actionDisabledID) => {
    this.setState({ actionDisabledModalOpen: true, actionDisabledID });
  };
  handleActionDisabledModalClose = () => {
    this.setState({ actionDisabledModalOpen: false, actionDisabledID: null });
  };

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
        label: ServiceActionLabels.open,
        onItemSelect: this.onActionsItemSelection.bind(this, OPEN),
      });
    }

    actions.push({
      label: i18nMark("Edit"),
      onItemSelect: this.onActionsItemSelection.bind(this, EDIT),
    });

    if (!pod.getLabels().MARATHON_SINGLE_INSTANCE_APP) {
      actions.push({
        label: i18nMark("Scale"),
        onItemSelect: this.onActionsItemSelection.bind(this, SCALE),
      });
    }

    if (pod.isDelayed()) {
      actions.push({
        label: i18nMark("Reset Delay"),
        onItemSelect: this.onActionsItemSelection.bind(this, RESET_DELAYED),
      });
    }

    if (instanceCount > 0) {
      actions.push({
        label: i18nMark("Stop"),
        onItemSelect: this.onActionsItemSelection.bind(this, STOP),
      });
    }

    if (instanceCount === 0) {
      actions.push({
        label: i18nMark("Resume"),
        onItemSelect: this.onActionsItemSelection.bind(this, RESUME),
      });
    }

    actions.push({
      className: "text-danger",
      label: i18nMark("Delete"),
      onItemSelect: this.onActionsItemSelection.bind(this, DELETE),
    });

    return actions;
  }

  hasVolumes() {
    return !!this.props.pod && this.props.pod.getVolumesData().length > 0;
  }

  getTabs() {
    const { id } = this.props.pod;
    const routePrefix = `/services/detail/${encodeURIComponent(id)}`;

    const tabs = [
      { label: i18nMark("Tasks"), routePath: `${routePrefix}/tasks` },
      {
        label: i18nMark("Configuration"),
        routePath: `${routePrefix}/configuration`,
      },
      { label: i18nMark("Debug"), routePath: `${routePrefix}/debug` },
      { label: i18nMark("Endpoints"), routePath: `${routePrefix}/endpoints` },
    ];

    if (this.hasVolumes()) {
      tabs.push({
        label: i18nMark("Volumes"),
        routePath: `${routePrefix}/podvolumes`,
      });
    }

    return tabs;
  }

  render() {
    const { children, pod } = this.props;
    const { actionDisabledModalOpen, actionDisabledID } = this.state;

    const breadcrumbs = <ServiceBreadcrumbs serviceID={pod.id} />;

    // TODO (DCOS_OSS-1038): Move cloned props to route parameters
    const clonedProps = { service: pod };
    const clonedChildren = React.Children.map(children, (child) => {
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
            onStop={this.handleActionSuspend}
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
    stopService: PropTypes.func,
    deleteService: PropTypes.func,
  }).isRequired,
  router: routerShape,
};

export default PodDetail;
