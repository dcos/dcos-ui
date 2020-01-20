import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import { Dropdown, Tooltip } from "reactjs-components";
import { Link } from "react-router";
import mixin from "reactjs-mixin";
import * as React from "react";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import Loader from "#SRC/js/components/Loader";
import Page from "#SRC/js/components/Page";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

import BackendsTable from "./BackendsTable";
import NetworkingVIPsStore from "../stores/NetworkingVIPsStore";
import NetworkItemDetails from "./NetworkItemDetails";
import NetworkingTooltipContent from "../constants/NetworkingTooltipContent";

const NetworkItemChart = React.lazy(() =>
  import(/* webpackChunkName: "networkitemchart" */ "./NetworkItemChart")
);

const VIPBreadcrumbs = ({ vip: { vip, port, protocol } }) => {
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
    </Breadcrumb>
  ];

  return (
    <Page.Header.Breadcrumbs
      iconID={ProductIcons.Network}
      breadcrumbs={crumbs}
    />
  );
};

class VIPDetail extends mixin(StoreMixin) {
  constructor(...args) {
    super(...args);

    this.store_listeners = [
      { name: "networkingVIPs", events: ["detailSuccess", "detailError"] }
    ];

    this.tabs_tabs = {
      backends: i18nMark("Backends")
    };

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift(),
      selectedDropdownItem: "success"
    };

    this.vipDetailSuccess = false;
    this.vipDetailErrorCount = 0;
  }

  componentDidMount(...args) {
    super.componentDidMount(...args);

    const { vip, port, protocol } = this.props.params;

    NetworkingVIPsStore.startFetchVIPDetail(protocol, vip, port);
  }

  componentWillUnmount(...args) {
    super.componentWillUnmount(...args);
    NetworkingVIPsStore.stopFetchVIPDetail();
  }

  onNetworkingVIPsStoreDetailError() {
    const vipDetailErrorCount = this.vipDetailErrorCount + 1;
    this.vipDetailErrorCount = vipDetailErrorCount;
    this.forceUpdate();
  }

  onNetworkingVIPsStoreDetailSuccess() {
    this.vipDetailSuccess = true;
    this.vipDetailErrorCount = 0;
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
        id: "success"
      },
      {
        html: <Trans render="span">Connection Latency</Trans>,
        selectedHtml: this.getDropdownItemSelectedHtml(
          i18nMark("Connection Latency per Minute"),
          backendCount
        ),
        id: "connection-latency"
      },
      {
        html: (
          <Trans render="span">Application Availability and Reachability</Trans>
        ),
        selectedHtml: this.getDropdownItemSelectedHtml(
          i18nMark("Application Availability and Reachability per Minute"),
          backendCount
        ),
        id: "app-reachability"
      },
      {
        html: (
          <Trans render="span">Machine Availability and Reachability</Trans>
        ),
        selectedHtml: this.getDropdownItemSelectedHtml(
          i18nMark("Machine Availability and Reachability per Minute"),
          backendCount
        ),
        id: "machine-reachability"
      }
    ];
  }

  getDropdownItemSelectedHtml(label, backendCount) {
    const backendTotal =
      backendCount === 1 ? (
        <Trans render="span" className="dropdown-toggle-label-secondary">
          1 Total Backend
        </Trans>
      ) : (
        <Trans render="span" className="dropdown-toggle-label-secondary">
          {backendCount} Total Backends
        </Trans>
      );

    return (
      <span className="dropdown-toggle-label text-align-left">
        <Trans
          id={label}
          render="span"
          className="dropdown-toggle-label-primary button-split-content-wrapper"
        />
        {backendTotal}
      </span>
    );
  }

  getPageContents(backends) {
    return (
      <BackendsTable
        backends={backends}
        displayedData={this.state.selectedDropdownItem}
        vipProtocol={this.props.params.protocol}
        params={this.props.params}
      />
    );
  }

  getPageHeading(backends) {
    return (
      <div className="vip-details-heading row row-flex">
        <div className="column-9">
          <Dropdown
            buttonClassName="dropdown-toggle button button-transparent button-split-content flush-left"
            dropdownMenuClassName="dropdown-menu"
            dropdownMenuListClassName="dropdown-menu-list"
            dropdownMenuListItemClassName="clickable"
            initialID="success"
            items={this.getDropdownItems(backends.getItems().length)}
            onItemSelection={this.handleVIPDetailDropdownChange}
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
                  NetworkingTooltipContent.vip[this.state.selectedDropdownItem]
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
    const { vip, port, protocol } = this.props.params;
    const { currentTab } = this.state;
    const vipDetails =
      NetworkingVIPsStore.getVIPDetail(`${protocol}:${vip}:${port}`) || {};

    const tabs = [
      {
        isActive: currentTab === "backends",
        label: i18nMark("Backends"),
        callback: () => {
          this.setState({ currentTab: "backends" });
        }
      }
    ];

    if (vipDetails.details && Object.keys(vipDetails.details).length) {
      this.tabs_tabs.details = "Details";

      tabs.push({
        isActive: currentTab === "details",
        label: i18nMark("Details"),
        callback: () => {
          this.setState({ currentTab: "details" });
        }
      });
    }

    return tabs;
  }
  handleVIPDetailDropdownChange = item => {
    this.setState({ selectedDropdownItem: item.id });
  };

  hasError() {
    return this.vipDetailErrorCount >= 3;
  }

  isLoading() {
    return !this.vipDetailSuccess;
  }

  tabs_getTabView(...args) {
    const currentTab = this.tabs_tabs[this.state.currentTab].replace(" ", "");
    return this[`render${currentTab}TabView`]?.apply(this, args);
  }

  renderBackendsTabView() {
    const { vip, port, protocol } = this.props.params;
    let content;
    let chart;
    let vipDetailsHeading;

    if (this.hasError()) {
      content = <RequestErrorMsg />;
    } else if (this.isLoading()) {
      content = <Loader />;
    } else {
      const vipDetails = NetworkingVIPsStore.getVIPDetail(
        `${protocol}:${vip}:${port}`
      );
      const backends = vipDetails.getBackends();

      chart = (
        <React.Suspense fallback={<Loader />}>
          <NetworkItemChart
            chartData={vipDetails}
            selectedData={this.state.selectedDropdownItem}
          />
        </React.Suspense>
      );
      content = this.getPageContents(backends);
      vipDetailsHeading = this.getPageHeading(backends);
    }

    return (
      <div>
        {vipDetailsHeading}
        {chart}
        {content}
      </div>
    );
  }

  renderDetailsTabView() {
    const { vip, port, protocol } = this.props.params;

    const vipDetails = NetworkingVIPsStore.getVIPDetail(
      `${protocol}:${vip}:${port}`
    );

    return <NetworkItemDetails details={vipDetails.details} />;
  }

  render() {
    return (
      <Page>
        <Page.Header
          breadcrumbs={<VIPBreadcrumbs vip={this.props.params} />}
          tabs={this.getTabs()}
        />
        {this.tabs_getTabView()}
      </Page>
    );
  }
}

export default VIPDetail;
