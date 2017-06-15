import mixin from "reactjs-mixin";
import React, { PropTypes } from "react";
import { routerShape } from "react-router";

import ActionKeys from "../../constants/ActionKeys";
import Page from "../../../../../../src/js/components/Page";
import MarathonErrorUtil from "../../utils/MarathonErrorUtil";
import ServiceBreadcrumbs from "../../components/ServiceBreadcrumbs";
import Service from "../../structs/Service";
import ServiceActionItem from "../../constants/ServiceActionItem";
import ServiceConfigurationContainer
  from "../service-configuration/ServiceConfigurationContainer";
import ServiceDebugContainer from "../service-debug/ServiceDebugContainer";
import ServiceTasksContainer from "../tasks/ServiceTasksContainer";
import TabsMixin from "../../../../../../src/js/mixins/TabsMixin";
import VolumeTable from "../../components/VolumeTable";

const METHODS_TO_BIND = ["handleEditClearError", "onActionsItemSelection"];

class ServiceDetail extends mixin(TabsMixin) {
  constructor() {
    super(...arguments);

    this.tabs_tabs = {
      tasks: "Instances",
      configuration: "Configuration",
      debug: "Debug"
    };

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift()
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    this.checkForVolumes();
  }

  componentWillUpdate() {
    super.componentWillUpdate(...arguments);
    this.checkForVolumes();
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
          `/services/overview/${encodeURIComponent(service.getId())}/edit/`
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
      case ServiceActionItem.DESTROY:
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
    if (this.tabs_tabs.volumes == null && this.hasVolumes()) {
      this.tabs_tabs.volumes = "Volumes";
      this.forceUpdate();
    }
  }

  renderConfigurationTabView() {
    const { actions, errors, service } = this.props;

    return (
      <ServiceConfigurationContainer
        errors={MarathonErrorUtil.parseErrors(errors[ActionKeys.SERVICE_EDIT])}
        onClearError={this.handleEditClearError}
        onEditClick={actions.editService}
        service={service}
      />
    );
  }

  renderDebugTabView() {
    return <ServiceDebugContainer service={this.props.service} />;
  }

  renderVolumesTabView() {
    return (
      <VolumeTable
        params={this.props.params}
        routes={this.props.routes}
        service={this.props.service}
        volumes={this.props.service.getVolumes().getItems()}
      />
    );
  }

  renderInstancesTabView() {
    return (
      <ServiceTasksContainer
        params={this.props.params}
        service={this.props.service}
      />
    );
  }

  getActions() {
    const { service } = this.props;
    const { modalHandlers, router } = this.context;
    const instanceCount = service.getInstancesCount();

    const actions = [];

    actions.push({
      label: "Edit",
      onItemSelect() {
        router.push(
          `/services/overview/${encodeURIComponent(service.getId())}/edit/`
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
      label: "Destroy",
      onItemSelect: modalHandlers.deleteService
    });

    return actions;
  }

  getTabs() {
    const { service: { id } } = this.props;
    const routePrefix = `/services/overview/${encodeURIComponent(id)}`;

    const tabs = [];
    const activeTab = this.state.currentTab;

    tabs.push({
      label: "Instances",
      callback: () => {
        this.setState({ currentTab: "tasks" });
      },
      isActive: activeTab === "tasks"
    });

    tabs.push({
      label: "Configuration",
      callback: () => {
        this.setState({ currentTab: "configuration" });
      },
      isActive: activeTab === "configuration"
    });

    tabs.push({
      label: "Debug",
      callback: () => {
        this.setState({ currentTab: "debug" });
      },
      isActive: activeTab === "debug"
    });

    if (this.hasVolumes()) {
      tabs.push({
        label: "Volumes",
        routePath: routePrefix + "/volumes",
        callback: () => {
          this.setState({ currentTab: "volumes" });
        },
        isActive: activeTab === "volumes"
      });
    }

    return tabs;
  }

  render() {
    const { children, service: { id } } = this.props;
    const breadcrumbs = <ServiceBreadcrumbs serviceID={id} />;

    return (
      <Page>
        <Page.Header
          actions={this.getActions()}
          tabs={this.getTabs()}
          breadcrumbs={breadcrumbs}
          iconID="services"
        />
        {this.tabs_getTabView()}
        {children}
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
    deleteService: PropTypes.func
  }).isRequired,
  router: routerShape
};

ServiceDetail.propTypes = {
  actions: PropTypes.object.isRequired,
  clearError: PropTypes.func,
  errors: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  service: PropTypes.instanceOf(Service),
  children: PropTypes.node
};

module.exports = ServiceDetail;
