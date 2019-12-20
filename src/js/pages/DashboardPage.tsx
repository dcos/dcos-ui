import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import { routerShape, Link } from "react-router";
import * as React from "react";
import createReactClass from "create-react-class";
import { Icon } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import DCOSStore from "#SRC/js/stores/DCOSStore";
import * as ResourcesUtil from "#SRC/js/utils/ResourcesUtil";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

import Breadcrumb from "../components/Breadcrumb";
import Loader from "../components/Loader";
import BreadcrumbTextContent from "../components/BreadcrumbTextContent";
import ComponentList from "../components/ComponentList";
import Config from "../config/Config";
import MesosSummaryStore from "../stores/MesosSummaryStore";
import Page from "../components/Page";
import Panel from "../components/Panel";
import ServiceList from "../../../plugins/services/src/js/components/ServiceList";
import StringUtil from "../utils/StringUtil";
import SidebarActions from "../events/SidebarActions";
import UnitHealthStore from "../stores/UnitHealthStore";
import DashboardHeadings from "../constants/DashboardHeadings";
import HealthUnitsList from "../structs/HealthUnitsList";

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

const ResourceTimeSeriesChart = React.lazy(() =>
  import(
    /* webpackChunkName: "resourcetimeserieschart" */ "../components/charts/ResourceTimeSeriesChart"
  )
);
const HostTimeSeriesChart = React.lazy(() =>
  import(
    /* webpackChunkName: "hosttimeserieschart" */ "../components/charts/HostTimeSeriesChart"
  )
);
const TasksChart = React.lazy(() =>
  import(/* webpackChunkName: "taskschart" */ "../components/charts/TasksChart")
);

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

  return (
    <Page.Header.Breadcrumbs iconID={ProductIcons.Graph} breadcrumbs={crumbs} />
  );
};

const DashboardPage = createReactClass({
  displayName: "DashboardPage",

  mixins: [StoreMixin],

  statics: {
    routeConfig: {
      label: i18nMark("Dashboard"),
      icon: <Icon shape={ProductIcons.GraphInverse} size={iconSizeS} />,
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

  getInitialState() {
    return {
      dcosServices: [],
      unitHealthUnits: new HealthUnitsList({ items: [] })
    };
  },

  UNSAFE_componentWillMount() {
    this.store_listeners = [
      { name: "dcos", events: ["change"], suppressUpdate: true },
      { name: "summary", events: ["success", "error"], suppressUpdate: true },
      { name: "unitHealth", events: ["success", "error"], suppressUpdate: true }
    ];

    this.setState({ mesosState: getMesosState() });
  },

  onSummaryStoreError() {
    this.setState({
      mesosState: { ...this.state.mesosState, ...getMesosState() }
    });
  },

  onSummaryStoreSuccess() {
    this.setState({
      mesosState: { ...this.state.mesosState, ...getMesosState() }
    });
  },

  onDcosStoreChange() {
    this.setState({
      dcosServices: DCOSStore.serviceTree.getServices().getItems()
    });
  },

  onUnitHealthStoreSuccess() {
    this.setState({
      unitHealthUnits: UnitHealthStore.getUnits()
    });
  },

  onUnitHealthStoreError() {
    this.setState({
      unitHealthUnits: UnitHealthStore.getUnits()
    });
  },

  getServicesList() {
    const services = this.state.dcosServices;

    const sortedServices = services.sort((firstService, secondService) => {
      const firstStatus = firstService.getServiceStatus();
      const secondStatus = secondService.getServiceStatus();

      // We invert this, since we want to show the highest priorities last.
      return secondStatus.priority - firstStatus.priority;
    });

    return sortedServices.slice(0, this.props.servicesListLength);
  },

  getUnits() {
    return this.state.unitHealthUnits;
  },

  getViewAllComponentsButton() {
    const componentCount = this.getUnits().getItems().length;
    if (!componentCount) {
      return null;
    }

    /* L10NTODO: Pluralize */
    const componentCountWord = StringUtil.pluralize(
      "Component",
      componentCount
    );

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
    let servicesCount = this.state.dcosServices.length;
    if (!servicesCount) {
      return null;
    }

    if (servicesCount < this.props.servicesListLength) {
      servicesCount = null;
    }

    /* L10NTODO: Pluralize */
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
    const data = this.state.mesosState;

    return (
      <Page title="Dashboard">
        <Page.Header breadcrumbs={<DashboardBreadcrumbs />} />
        <div className="panel-grid row">
          <div className={columnClasses}>
            <Panel
              className="dashboard-panel dashboard-panel-chart dashboard-panel-chart-timeseries panel"
              heading={this.getHeading(DashboardHeadings.CPU)}
            >
              <React.Suspense fallback={<Loader />}>
                <ResourceTimeSeriesChart
                  colorIndex={resourceColors.cpus}
                  usedResourcesStates={data.usedResourcesStates}
                  usedResources={data.usedResources}
                  totalResources={data.totalResources}
                  mode="cpus"
                  refreshRate={Config.getRefreshRate()}
                />
              </React.Suspense>
            </Panel>
          </div>
          <div className={columnClasses}>
            <Panel
              className="dashboard-panel dashboard-panel-chart dashboard-panel-chart-timeseries panel"
              heading={this.getHeading(DashboardHeadings.MEMORY)}
            >
              <React.Suspense fallback={<Loader />}>
                <ResourceTimeSeriesChart
                  colorIndex={resourceColors.mem}
                  usedResourcesStates={data.usedResourcesStates}
                  usedResources={data.usedResources}
                  totalResources={data.totalResources}
                  mode="mem"
                  refreshRate={Config.getRefreshRate()}
                />
              </React.Suspense>
            </Panel>
          </div>
          <div className={columnClasses}>
            <Panel
              className="dashboard-panel dashboard-panel-chart dashboard-panel-chart-timeseries panel"
              heading={this.getHeading(DashboardHeadings.DISK)}
            >
              <React.Suspense fallback={<Loader />}>
                <ResourceTimeSeriesChart
                  colorIndex={resourceColors.disk}
                  usedResourcesStates={data.usedResourcesStates}
                  usedResources={data.usedResources}
                  totalResources={data.totalResources}
                  mode="disk"
                  refreshRate={Config.getRefreshRate()}
                />
              </React.Suspense>
            </Panel>
          </div>
          <div className={columnClasses}>
            <Panel
              className="dashboard-panel dashboard-panel-chart dashboard-panel-chart-timeseries panel"
              heading={this.getHeading(DashboardHeadings.GPU)}
            >
              <React.Suspense fallback={<Loader />}>
                <ResourceTimeSeriesChart
                  colorIndex={resourceColors.gpus}
                  usedResourcesStates={data.usedResourcesStates}
                  usedResources={data.usedResources}
                  totalResources={data.totalResources}
                  mode="gpus"
                  refreshRate={Config.getRefreshRate()}
                />
              </React.Suspense>
            </Panel>
          </div>
          <div className={columnClasses}>
            <Panel
              className="dashboard-panel dashboard-panel-chart dashboard-panel-chart-timeseries panel"
              heading={this.getHeading(DashboardHeadings.NODES)}
            >
              <React.Suspense fallback={<Loader />}>
                <HostTimeSeriesChart
                  data={data.activeNodes}
                  currentValue={data.hostCount}
                  refreshRate={Config.getRefreshRate()}
                  colorIndex={4}
                />
              </React.Suspense>
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
              <React.Suspense fallback={<Loader />}>
                <TasksChart tasks={data.tasks} />
              </React.Suspense>
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

export default DashboardPage;
