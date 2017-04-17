import { injectIntl } from "react-intl";
import mixin from "reactjs-mixin";
import React, { PropTypes } from "react";
import { routerShape } from "react-router";

import Page from "#SRC/js/components/Page";
import RouterUtil from "#SRC/js/utils/RouterUtil";
import StringUtil from "#SRC/js/utils/StringUtil";
import TabsMixin from "#SRC/js/mixins/TabsMixin";
import UserActions from "#SRC/js/constants/UserActions";

import ActionKeys from "../../constants/ActionKeys";
import MarathonErrorUtil from "../../utils/MarathonErrorUtil";
import Service from "../../structs/Service";
import ServiceActionItem from "../../constants/ServiceActionItem";
import ServiceBreadcrumbs from "../../components/ServiceBreadcrumbs";
import ServiceModals from "../../components/modals/ServiceModals";

const METHODS_TO_BIND = ["handleEditClearError", "onActionsItemSelection"];

class ServiceDetail extends mixin(TabsMixin) {
  constructor() {
    super(...arguments);

    this.tabs_tabs = {
      "/services/overview/:id/tasks": "Instances",
      "/services/overview/:id/configuration": "Configuration",
      "/services/overview/:id/debug": "Debug"
    };

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift()
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    super.componentWillMount(...arguments);
    this.updateCurrentTab();
    this.checkForVolumes();
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(...arguments);
    this.updateCurrentTab(nextProps);
    this.checkForVolumes();
  }

  updateCurrentTab(props = this.props) {
    const { routes } = props;
    const currentTab = RouterUtil.reconstructPathFromRoutes(routes);
    if (currentTab != null) {
      this.setState({ currentTab });
    }
  }

  handleEditClearError() {
    this.props.clearError(ActionKeys.SERVICE_EDIT);
  }

  onActionsItemSelection(actionItem) {
    const { modalHandlers, router } = this.context;
    const { service } = this.props;

    switch (actionItem.id) {
      case ServiceActionItem.EDIT:
        router.push(
          `/services/detail/${encodeURIComponent(service.getId())}/edit/`
        );
        break;
      case ServiceActionItem.SCALE:
        modalHandlers.scaleService({ service });
        break;
      case ServiceActionItem.RESTART:
        modalHandlers.restartService({ service });
        break;
      case ServiceActionItem.SUSPEND:
        modalHandlers.suspendService({ service });
        break;
      case ServiceActionItem.DELETE:
        modalHandlers.deleteService({ service });
        break;
    }
  }

  hasVolumes() {
    return (
      !!this.props.service &&
      this.props.service.getVolumes().getItems().length > 0
    );
  }

  checkForVolumes() {
    // Add the Volumes tab if it isn't already there and the service has
    // at least one volume.
    if (
      this.tabs_tabs["/services/overview/:id/volumes"] == null &&
      this.hasVolumes()
    ) {
      this.tabs_tabs["/services/overview/:id/volumes"] = "Volumes";
      this.forceUpdate();
    }
  }

  getActions() {
    const { service } = this.props;
    const { modalHandlers, router } = this.context;
    const instanceCount = service.getInstancesCount();

    const actions = [];

    if (
      service instanceof Service &&
      service.getWebURL() != null &&
      service.getWebURL() !== ""
    ) {
      actions.push({
        label: this.props.intl.formatMessage({
          id: "SERVICE_ACTIONS.OPEN_SERVICE"
        }),
        onItemSelect() {
          modalHandlers.openServiceUI({ service });
        }
      });
    }

    actions.push({
      label: "Edit",
      onItemSelect() {
        router.push(
          `/services/detail/${encodeURIComponent(service.getId())}/edit/`
        );
      }
    });

    if (instanceCount > 0) {
      actions.push({
        label: "Restart",
        onItemSelect: modalHandlers.restartService
      });
    }
    if (!service.getLabels().MARATHON_SINGLE_INSTANCE_APP) {
      actions.push({
        label: "Scale",
        onItemSelect: modalHandlers.scaleService
      });
    }

    if (instanceCount > 0) {
      actions.push({
        label: "Suspend",
        onItemSelect: modalHandlers.suspendService
      });
    }

    if (instanceCount === 0) {
      actions.push({
        label: "Resume",
        onItemSelect: modalHandlers.resumeService
      });
    }

    actions.push({
      className: "text-danger",
      label: StringUtil.capitalize(UserActions.DELETE),
      onItemSelect: modalHandlers.deleteService
    });

    return actions;
  }

  getTabs() {
    const { service: { id } } = this.props;
    const routePrefix = `/services/detail/${encodeURIComponent(id)}`;

    const tabs = [
      { label: "Instances", routePath: `${routePrefix}/tasks` },
      { label: "Configuration", routePath: `${routePrefix}/configuration` },
      { label: "Debug", routePath: `${routePrefix}/debug` }
    ];

    if (this.hasVolumes()) {
      tabs.push({
        label: "Volumes",
        routePath: `${routePrefix}/volumes`
      });
    }

    return tabs;
  }

  render() {
    const { children, actions, errors, params, routes, service } = this.props;
    const breadcrumbs = <ServiceBreadcrumbs serviceID={service.id} />;
    const clonedProps = {
      params,
      routes,
      service,
      errors: MarathonErrorUtil.parseErrors(errors[ActionKeys.SERVICE_EDIT]),
      onClearError: this.handleEditClearError,
      onEditClick: actions.editService,
      volumes: service.getVolumes().getItems()
    };

    // TODO (DCOS_OSS-1038): Move cloned props to route parameters
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
          tabs={this.getTabs()}
          breadcrumbs={breadcrumbs}
          iconID="services"
        />
        {clonedChildren}
      </Page>
    );
  }
}

ServiceDetail.contextTypes = {
  clearError() {},
  modalHandlers: PropTypes.shape({
    scaleService: PropTypes.func,
    restartService: PropTypes.func,
    suspendService: PropTypes.func,
    deleteService: PropTypes.func,
    openService: PropTypes.func
  }).isRequired,
  router: routerShape
};

ServiceDetail.propTypes = {
  actions: PropTypes.object.isRequired,
  clearError: PropTypes.func,
  errors: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  service: PropTypes.instanceOf(Service).isRequired,
  children: PropTypes.node
};

module.exports = injectIntl(ServiceDetail);
