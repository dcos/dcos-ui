import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import { Dropdown, Tooltip } from "reactjs-components";
import { Link } from "react-router";
import mixin from "reactjs-mixin";
import * as React from "react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import Loader from "#SRC/js/components/Loader";
import Page from "#SRC/js/components/Page";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

import ClientsTable from "./ClientsTable";
import NetworkItemDetails from "./NetworkItemDetails";
import NetworkingBackendConnectionsStore from "../stores/NetworkingBackendConnectionsStore";
import NetworkingTooltipContent from "../constants/NetworkingTooltipContent";

const NetworkItemChart = React.lazy(
  () => import(/* webpackChunkName: "networkitemchart" */ "./NetworkItemChart")
);

const BackendBreadcrumbs = ({ params }) => {
  const {
    vip,
    port,
    protocol,
    backend_vip,
    backend_port,
    backend_protocol,
  } = params;

  const crumbs = [
    <Breadcrumb key={0} title="Service Addresses">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/networking/service-addresses" />}>
          Service Addresses
        </Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>,
    <Breadcrumb key={1} title={`${vip}:${port}`}>
      <BreadcrumbTextContent>
        <Link
          to={`/networking/service-addresses/internal/service-address-detail/${vip}/${protocol}/${port}/`}
        >
          {vip}:{port}
        </Link>
      </BreadcrumbTextContent>
    </Breadcrumb>,
    <Breadcrumb key={2} title={`${backend_vip}:${backend_port}`}>
      <BreadcrumbTextContent>
        <Link
          to={`/networking/service-addresses/internal/service-address-detail/${vip}/${protocol}/${port}/backend-detail/${backend_vip}/${backend_protocol}/${backend_port}/`}
        >
          {backend_vip}:{backend_port}
        </Link>
      </BreadcrumbTextContent>
    </Breadcrumb>,
  ];

  return (
    <Page.Header.Breadcrumbs
      iconID={ProductIcons.Network}
      breadcrumbs={crumbs}
    />
  );
};

class BackendDetailPage extends mixin(StoreMixin) {
  store_listeners = [
    { name: "networkingBackendConnections", events: ["success", "error"] },
  ];

  tabs_tabs = {
    clients: i18nMark("Clients"),
  };

  state = {
    currentTab: Object.keys(this.tabs_tabs).shift(),
    selectedDropdownItem: "success",
  };

  backendConnectionRequestSuccess = false;
  backendConnectionRequestErrorCount = 0;

  componentDidMount() {
    super.componentDidMount();

    const { backend_vip, backend_port, backend_protocol } = this.props.params;

    NetworkingBackendConnectionsStore.startFetchBackendConnections(
      backend_protocol,
      backend_vip,
      backend_port
    );
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    NetworkingBackendConnectionsStore.stopFetchBackendConnections();
  }

  onNetworkingBackendConnectionsStoreError() {
    this.backendConnectionRequestErrorCount++;
    this.forceUpdate();
  }

  onNetworkingBackendConnectionsStoreSuccess() {
    this.backendConnectionRequestSuccess = true;
    this.backendConnectionRequestErrorCount = 0;
    this.forceUpdate();
  }

  getDropdownItems(backendCount) {
    return [
      {
        html: <Trans render="span">Successes and Failures</Trans>,
        selectedHtml: this.getDropdownItemSelectedHtml(
          i18nMark("Successes and Failures per Minute"),
          backendCount
        ),
        id: "success",
      },
      {
        html: <Trans render="span">Connection Latency</Trans>,
        selectedHtml: this.getDropdownItemSelectedHtml(
          i18nMark("Connection Latency per Minute"),
          backendCount
        ),
        id: "connection-latency",
      },
    ];
  }

  getDropdownItemSelectedHtml(label, clientCount) {
    const totalClients =
      clientCount === 1 ? (
        <Trans render="span" className="dropdown-toggle-label-secondary">
          1 Total Client
        </Trans>
      ) : (
        <Trans render="span" className="dropdown-toggle-label-secondary">
          {clientCount} Total Clients
        </Trans>
      );

    return (
      <span className="dropdown-toggle-label text-align-left">
        <Trans
          id={label}
          render="span"
          className="dropdown-toggle-label-primary"
        />
        {totalClients}
      </span>
    );
  }

  getPageHeading(clients) {
    return (
      <div className="vip-details-heading row row-flex">
        <div className="column-9">
          <Dropdown
            buttonClassName="button dropdown-toggle dropdown-toggle-transparent
              dropdown-toggle-caret-align-top"
            dropdownMenuClassName="dropdown-menu"
            dropdownMenuListClassName="dropdown-menu-list"
            dropdownMenuListItemClassName="clickable"
            initialID="success"
            items={this.getDropdownItems(clients.getItems().length)}
            onItemSelection={this.handleBackendDetailDropdownChange}
            scrollContainer=".gm-scroll-view"
            scrollContainerParentSelector=".gm-prevented"
            transition={true}
            transitionName="dropdown-menu"
            wrapperClassName="dropdown dropdown-chart-details"
          />
        </div>
        <div className="column-3 text-align-right">
          <Tooltip
            wrapText={true}
            width={250}
            wrapperClassName="tooltip-wrapper
            text-align-right"
            position="top"
            anchor="end"
            content={
              <Trans
                render="span"
                id={
                  NetworkingTooltipContent.backend[
                    this.state.selectedDropdownItem
                  ]
                }
              />
            }
          >
            <InfoTooltipIcon />
          </Tooltip>
        </div>
      </div>
    );
  }

  getTabs() {
    const { backend_vip, backend_port, backend_protocol } = this.props.params;
    const backendDetails =
      NetworkingBackendConnectionsStore.getBackendConnections(
        `${backend_protocol}:${backend_vip}:${backend_port}`
      ) || {};

    const tabs = [
      {
        label: "Clients",
        callback: () => {
          this.setState({ currentTab: "clients" });
        },
      },
    ];

    if (backendDetails.details && Object.keys(backendDetails.details).length) {
      this.tabs_tabs.details = i18nMark("Details");

      tabs.push({
        label: "Details",
        callback: () => {
          this.setState({ currentTab: "details" });
        },
      });
    }

    return tabs;
  }
  handleBackendDetailDropdownChange = (item) => {
    this.setState({ selectedDropdownItem: item.id });
  };

  hasError() {
    return this.backendConnectionRequestErrorCount >= 3;
  }

  isLoading() {
    return !this.backendConnectionRequestSuccess;
  }

  renderClientsTabView() {
    const { backend_vip, backend_port, backend_protocol } = this.props.params;
    let backendDetailsHeading;
    let chart;
    let content;

    if (this.hasError()) {
      content = <RequestErrorMsg />;
    } else if (this.isLoading()) {
      content = <Loader />;
    } else {
      const backendConnectionDetails = NetworkingBackendConnectionsStore.getBackendConnections(
        `${backend_protocol}:${backend_vip}:${backend_port}`
      );
      const clients = backendConnectionDetails.getClients();

      chart = (
        <React.Suspense fallback={<Loader />}>
          <NetworkItemChart
            chartData={backendConnectionDetails}
            selectedData={this.state.selectedDropdownItem}
          />
        </React.Suspense>
      );
      content = <ClientsTable clients={clients} />;
      backendDetailsHeading = this.getPageHeading(clients);
    }

    return (
      <div>
        {backendDetailsHeading}
        {chart}
        {content}
      </div>
    );
  }

  renderDetailsTabView() {
    const { backend_vip, backend_port, backend_protocol } = this.props.params;

    const backendDetails = NetworkingBackendConnectionsStore.getBackendConnections(
      `${backend_protocol}:${backend_vip}:${backend_port}`
    );

    return <NetworkItemDetails details={backendDetails.details} />;
  }

  tabs_getTabView(...args) {
    const currentTab = this.tabs_tabs[this.state.currentTab].replace(" ", "");
    return this[`render${currentTab}TabView`]?.apply(this, args);
  }

  render() {
    return (
      <Page>
        <Page.Header
          breadcrumbs={<BackendBreadcrumbs params={this.props.params} />}
          tabs={this.getTabs()}
        />
        {this.tabs_getTabView()}
      </Page>
    );
  }
}

export default BackendDetailPage;
