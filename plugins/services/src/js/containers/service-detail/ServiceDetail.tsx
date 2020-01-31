import PropTypes from "prop-types";
import * as React from "react";
import { routerShape } from "react-router";
import { Hooks } from "PluginSDK";
import { i18nMark } from "@lingui/react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Page from "#SRC/js/components/Page";
import { isSDKService } from "#PLUGINS/services/src/js/utils/ServiceUtil";

import ActionKeys from "../../constants/ActionKeys";
import MarathonErrorUtil from "../../utils/MarathonErrorUtil";
import Service from "../../structs/Service";
import ServiceTree from "../../structs/ServiceTree";
import * as ServiceStatus from "../../constants/ServiceStatus";
import ServiceActionLabels from "../../constants/ServiceActionLabels";
import ServiceBreadcrumbs from "../../components/ServiceBreadcrumbs";
import ServiceModals from "../../components/modals/ServiceModals";
import ServiceActionDisabledModal from "../../components/modals/ServiceActionDisabledModal";
import { ServiceActionItem as Action } from "../../constants/ServiceActionItem";

class ServiceDetail extends React.Component<
  { service: ServiceTree },
  { actionDisabledID: null | string; actionDisabledModalOpen: boolean }
> {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    clearError: PropTypes.func,
    errors: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    service: PropTypes.instanceOf(Service).isRequired,
    children: PropTypes.node
  };

  constructor(a, ...args) {
    super(a, ...args);

    this.state = {
      actionDisabledID: null,
      actionDisabledModalOpen: false
    };
  }

  handleEditClearError = () => {
    this.props.clearError(ActionKeys.SERVICE_EDIT);
  };

  onActionsItemSelection(actionID: Action) {
    const { service } = this.props;
    const isGroup = service instanceof ServiceTree;
    let containsSDKService = false;

    if (isGroup) {
      containsSDKService =
        service.findItem(
          item => item instanceof Service && isSDKService(item)
        ) != null;
    }

    if (
      actionID !== Action.EDIT &&
      actionID !== Action.DELETE &&
      (containsSDKService || isSDKService(service)) &&
      !Hooks.applyFilter(
        "isEnabledSDKAction",
        actionID === Action.OPEN,
        actionID
      )
    ) {
      this.handleActionDisabledModalOpen(actionID);
    } else {
      this.handleServiceAction(actionID);
    }
  }

  handleServiceAction(actionID: Action) {
    const { modalHandlers, router } = this.context;
    const { service } = this.props;

    switch (actionID) {
      case Action.EDIT:
        router.push(
          `/services/detail/${encodeURIComponent(service.getId())}/edit/`
        );
        return;
      case Action.SCALE:
        modalHandlers.scaleService({ service });
        return;
      case Action.RESET_DELAYED:
        modalHandlers.resetDelayedService({ service });
        return;
      case Action.OPEN:
        modalHandlers.openServiceUI({ service });
        return;
      case Action.RESTART:
        modalHandlers.restartService({ service });
        return;
      case Action.RESUME:
        modalHandlers.resumeService({ service });
        return;
      case Action.STOP:
        modalHandlers.stopService({ service });
        return;
      case Action.DELETE:
        modalHandlers.deleteService({ service });
        return;
    }
  }

  handleActionDisabledModalOpen = (actionDisabledID: Action) => {
    this.setState({ actionDisabledModalOpen: true, actionDisabledID });
  };

  handleActionDisabledModalClose = () => {
    this.setState({ actionDisabledModalOpen: false, actionDisabledID: null });
  };

  hasVolumes() {
    return !!this.props.service && this.props.service.getVolumes().length > 0;
  }

  getActions() {
    const { service } = this.props;
    const instanceCount = service.getInstancesCount();
    const isSDK = isSDKService(service);

    const actions: Array<{
      className?: string;
      label: string;
      onItemSelect: () => void;
    }> = [];

    if (
      service instanceof Service &&
      !isSDKService(service) &&
      service.getWebURL() != null &&
      service.getWebURL() !== ""
    ) {
      actions.push({
        label: ServiceActionLabels.open,
        onItemSelect: this.onActionsItemSelection.bind(this, Action.OPEN)
      });
    }

    actions.push({
      label: i18nMark("Edit"),
      onItemSelect: this.onActionsItemSelection.bind(this, Action.EDIT)
    });

    if (instanceCount > 0 && !isSDK) {
      actions.push({
        label: i18nMark("Restart"),
        onItemSelect: this.onActionsItemSelection.bind(this, Action.RESTART)
      });
    }
    if (!service.getLabels().MARATHON_SINGLE_INSTANCE_APP) {
      actions.push({
        label: i18nMark("Scale"),
        onItemSelect: this.onActionsItemSelection.bind(this, Action.SCALE)
      });
    }

    if (service.isDelayed()) {
      actions.push({
        label: i18nMark("Reset Delay"),
        onItemSelect: this.onActionsItemSelection.bind(
          this,
          Action.RESET_DELAYED
        )
      });
    }

    if (instanceCount > 0 && !isSDK) {
      actions.push({
        label: i18nMark("Stop"),
        onItemSelect: this.onActionsItemSelection.bind(this, Action.STOP)
      });
    }

    if (instanceCount === 0 && !isSDK) {
      actions.push({
        label: i18nMark("Resume"),
        onItemSelect: this.onActionsItemSelection.bind(this, Action.RESUME)
      });
    }

    actions.push({
      className: "text-danger",
      label: i18nMark("Delete"),
      onItemSelect: this.onActionsItemSelection.bind(this, Action.DELETE)
    });

    return actions;
  }

  getTabs() {
    const { id } = this.props.service;
    const routePrefix = `/services/detail/${encodeURIComponent(id)}`;

    // prettier-ignore
    const tabs = [
      { label: i18nMark("Tasks"), routePath: `${routePrefix}/tasks` },
      { label: i18nMark("Configuration"), routePath: `${routePrefix}/configuration` },
      { label: i18nMark("Debug"), routePath: `${routePrefix}/debug` },
      { label: i18nMark("Endpoints"), routePath: `${routePrefix}/endpoints` }
    ];

    if (isSDKService(this.props.service)) {
      tabs.push({
        label: i18nMark("Plans"),
        routePath: `${routePrefix}/plans`
      });
    }

    if (this.hasVolumes()) {
      tabs.push({
        label: i18nMark("Volumes"),
        routePath: `${routePrefix}/volumes`
      });
    }

    return tabs;
  }

  render() {
    const { children, actions, errors, params, routes, service } = this.props;
    const { actionDisabledModalOpen, actionDisabledID } = this.state;
    const breadcrumbs = (
      <ServiceBreadcrumbs
        params={params}
        serviceID={service.id}
        instancesCount={service.getInstancesCount()}
        runningInstances={service.getRunningInstancesCount()}
        serviceStatus={service.getServiceStatus()}
      />
    );
    const clonedProps = {
      params,
      routes,
      service,
      errors: MarathonErrorUtil.parseErrors(errors[ActionKeys.SERVICE_EDIT]),
      onClearError: this.handleEditClearError,
      onEditClick: actions.editService,
      volumes: service.getVolumes()
    };

    // TODO (DCOS_OSS-1038): Move cloned props to route parameters
    const clonedChildren = React.Children.map(children, child => {
      // Only add props to children that are not ServiceModals
      if (child.type === ServiceModals) {
        return child;
      }

      return React.cloneElement(child, clonedProps);
    });
    const isPlansTab = routes[routes.length - 1].path === "plans";

    return (
      <Page dontScroll={isPlansTab} flushBottom={isPlansTab}>
        <Page.Header
          actions={this.getActions()}
          tabs={this.getTabs()}
          breadcrumbs={breadcrumbs}
          iconID={ProductIcons.Services}
          actionsDisabled={
            service.getServiceStatus() === ServiceStatus.DELETING
          }
        />
        {clonedChildren}
        <ServiceActionDisabledModal
          actionID={actionDisabledID}
          open={actionDisabledModalOpen}
          onClose={this.handleActionDisabledModalClose}
          service={service}
        />
      </Page>
    );
  }
}

ServiceDetail.contextTypes = {
  clearError() {},
  modalHandlers: PropTypes.shape({
    scaleService: PropTypes.func,
    restartService: PropTypes.func,
    stopService: PropTypes.func,
    deleteService: PropTypes.func,
    openService: PropTypes.func,
    resetDelayedService: PropTypes.func
  }).isRequired,
  router: routerShape
};

export default ServiceDetail;
