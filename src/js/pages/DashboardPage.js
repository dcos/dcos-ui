import { Trans } from "@lingui/macro";
import { routerShape, Link } from "react-router";
import React from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";

import DCOSStore from "#SRC/js/stores/DCOSStore";
import ResourcesUtil from "#SRC/js/utils/ResourcesUtil";

import Breadcrumb from "../components/Breadcrumb";
import BreadcrumbTextContent from "../components/BreadcrumbTextContent";
import ComponentList from "../components/ComponentList";
import Config from "../config/Config";
import HealthSorting from "../../../plugins/services/src/js/constants/HealthSorting";
import HostTimeSeriesChart from "../components/charts/HostTimeSeriesChart";
import Icon from "../components/Icon";
import InternalStorageMixin from "../mixins/InternalStorageMixin";
import MesosSummaryStore from "../stores/MesosSummaryStore";
import Page from "../components/Page";
import Panel from "../components/Panel";
import ResourceTimeSeriesChart from "../components/charts/ResourceTimeSeriesChart";
import ServiceList from "../../../plugins/services/src/js/components/ServiceList";
import StringUtil from "../utils/StringUtil";
import TasksChart from "../components/charts/TasksChart";
import SidebarActions from "../events/SidebarActions";
import UnitHealthStore from "../stores/UnitHealthStore";
import DashboardHeadings from "../constants/DashboardHeadings";

function getMesosState() {
  const states = MesosSummaryStore.get("states");
  const last = states.lastSuccessful();

  return {
    activeNodes: states.getActiveNodesByState(),
    hostCount: last.getActiveSlaves().length,
    usedResourcesStates: states.getResourceStatesForNodeIDs(),
    usedResources: last.getSlaveUsedResources(),
    tasks: last.getServiceList().sumTaskStates(),
    totalResources: last.getSlaveTotalResources()
  };
}

const DashboardBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Dashboard">
      <BreadcrumbTextContent>
        <Link to="/dashboard">
          <Trans render="span">Dashboard</Trans>
        </Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return <Page.Header.Breadcrumbs iconID="dashboard" breadcrumbs={crumbs} />;
};

var DashboardPage = React.createClass({
  displayName: "DashboardPage",

  mixins: [InternalStorageMixin, StoreMixin],

  statics: {
    routeConfig: {
      label: "Dashboard",
      icon: <Icon id="dashboard-inverse" size="small" family="product" />,
      matches: /^\/dashboard/
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
    router: routerShape
  },

  getDefaultProps() {
    return {
      componentsListLength: 5,
      servicesListLength: 5
    };
  },

  componentWillMount() {
    this.store_listeners = [
      { name: "dcos", events: ["change"], suppressUpdate: true },
      { name: "summary", events: ["success", "error"], suppressUpdate: false },
      {
        name: "unitHealth",
        events: ["success", "error"],
        suppressUpdate: false
      }
    ];

    this.internalStorage_set({
      openServicePanel: false,
      openTaskPanel: false
    });
    this.internalStorage_update(getMesosState());
  },

  onSummaryStoreError() {
    this.internalStorage_update(getMesosState());
  },

  onSummaryStoreSuccess() {
    this.internalStorage_update(getMesosState());
  },

  getServicesList() {
    const services = DCOSStore.serviceTree.getServices().getItems();

    const sortedServices = services.sort(function(service, other) {
      const health = service.getHealth();
      const otherHealth = other.getHealth();

      return HealthSorting[health.key] - HealthSorting[otherHealth.key];
    });

    return sortedServices.slice(0, this.props.servicesListLength);
  },

  getUnits() {
    return UnitHealthStore.getUnits();
  },

  getViewAllComponentsButton() {
    var componentCount = this.getUnits().getItems().length;
    if (!componentCount) {
      return null;
    }

    /* L10NTODO: Pluralize */
    var componentCountWord = StringUtil.pluralize("Component", componentCount);

    return (
      <Trans
        render={
          <Link to="/components" className="button button-primary-link" />
        }
      >
        View all {componentCount} {componentCountWord}
      </Trans>
    );
  },

  getViewAllServicesBtn() {
    let servicesCount = DCOSStore.serviceTree.getServices().getItems().length;
    if (!servicesCount) {
      return null;
    }

    if (servicesCount < this.props.servicesListLength) {
      servicesCount = null;
    }

    return (
      <Trans
        render={<Link to="/services" className="button button-primary-link" />}
      >
        View all {servicesCount} Services
      </Trans>
    );
  },

  getHeading(translationId) {
    return (
      <Trans
        id={translationId}
        render="h3"
        className="flush text-align-center"
      />
    );
  },

  render() {
    const columnClasses = "column-12 column-small-6 column-large-4";
    const resourceColors = ResourcesUtil.getResourceColors();
    var data = this.internalStorage_get();

    return (
      <Page title="Dashboard">
        <Page.Header breadcrumbs={<DashboardBreadcrumbs />} />
        <div className="panel-grid row">
          <div className={columnClasses}>
            <Panel
              className="dashboard-panel dashboard-panel-chart dashboard-panel-chart-timeseries panel"
              heading={this.getHeading(DashboardHeadings.CPU)}
            >
              <ResourceTimeSeriesChart
                colorIndex={resourceColors["cpus"]}
                usedResourcesStates={data.usedResourcesStates}
                usedResources={data.usedResources}
                totalResources={data.totalResources}
                mode="cpus"
                refreshRate={Config.getRefreshRate()}
              />
            </Panel>
          </div>
          <div className={columnClasses}>
            <Panel
              className="dashboard-panel dashboard-panel-chart dashboard-panel-chart-timeseries panel"
              heading={this.getHeading(DashboardHeadings.MEMORY)}
            >
              <ResourceTimeSeriesChart
                colorIndex={resourceColors["mem"]}
                usedResourcesStates={data.usedResourcesStates}
                usedResources={data.usedResources}
                totalResources={data.totalResources}
                mode="mem"
                refreshRate={Config.getRefreshRate()}
              />
            </Panel>
          </div>
          <div className={columnClasses}>
            <Panel
              className="dashboard-panel dashboard-panel-chart dashboard-panel-chart-timeseries panel"
              heading={this.getHeading(DashboardHeadings.DISK)}
            >
              <ResourceTimeSeriesChart
                colorIndex={resourceColors["disk"]}
                usedResourcesStates={data.usedResourcesStates}
                usedResources={data.usedResources}
                totalResources={data.totalResources}
                mode="disk"
                refreshRate={Config.getRefreshRate()}
              />
            </Panel>
          </div>
          <div className={columnClasses}>
            <Panel
              className="dashboard-panel dashboard-panel-chart dashboard-panel-chart-timeseries panel"
              heading={this.getHeading(DashboardHeadings.GPU)}
            >
              <ResourceTimeSeriesChart
                colorIndex={resourceColors["gpus"]}
                usedResourcesStates={data.usedResourcesStates}
                usedResources={data.usedResources}
                totalResources={data.totalResources}
                mode="gpus"
                refreshRate={Config.getRefreshRate()}
              />
            </Panel>
          </div>
          <div className={columnClasses}>
            <Panel
              className="dashboard-panel dashboard-panel-chart dashboard-panel-chart-timeseries panel"
              heading={this.getHeading(DashboardHeadings.NODES)}
            >
              <HostTimeSeriesChart
                data={data.activeNodes}
                currentValue={data.hostCount}
                refreshRate={Config.getRefreshRate()}
                colorIndex={4}
              />
            </Panel>
          </div>
          <div className={columnClasses}>
            <Panel
              className="dashboard-panel dashboard-panel-list dashboard-panel-list-service-health allow-overflow panel"
              heading={this.getHeading(DashboardHeadings.SERVICES_STATUS)}
              footer={this.getViewAllServicesBtn()}
              footerClass="text-align-center"
            >
              <ServiceList services={this.getServicesList()} />
            </Panel>
          </div>
          <div className={columnClasses}>
            <Panel
              className="dashboard-panel dashboard-panel-chart panel"
              heading={this.getHeading(DashboardHeadings.TASKS)}
            >
              <TasksChart tasks={data.tasks} />
            </Panel>
          </div>
          <div className={columnClasses}>
            <Panel
              className="dashboard-panel dashboard-panel-list dashboard-panel-list-component-health panel"
              heading={this.getHeading(DashboardHeadings.COMPONENT_HEALTH)}
              footer={this.getViewAllComponentsButton()}
              footerClass="text-align-center"
            >
              <ComponentList
                displayCount={this.props.componentsListLength}
                units={this.getUnits()}
              />
            </Panel>
          </div>
        </div>
      </Page>
    );
  }
});

module.exports = DashboardPage;
