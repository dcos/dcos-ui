import mixin from "reactjs-mixin";
import { Link, routerShape } from "react-router";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";

import Breadcrumb from "../../../components/Breadcrumb";
import BreadcrumbTextContent from "../../../components/BreadcrumbTextContent";
import Loader from "../../../components/Loader";
import Page from "../../../components/Page";
import RequestErrorMsg from "../../../components/RequestErrorMsg";
import RouterUtil from "../../../utils/RouterUtil";
import TabsMixin from "../../../mixins/TabsMixin";
import VirtualNetworksStore from "../../../stores/VirtualNetworksStore";

const NetworksDetailBreadcrumbs = ({ overlayID, overlay }) => {
  const crumbs = [
    <Breadcrumb key={0} title="Networks">
      <BreadcrumbTextContent>
        <Link to="/networking/networks">Networks</Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  if (overlay) {
    const name = overlay.getName();
    crumbs.push(
      <Breadcrumb key={1} title={name}>
        <BreadcrumbTextContent>
          <Link to={`/networking/networks/${name}`}>{name}</Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    );
  } else {
    crumbs.push(
      <Breadcrumb key={1} title={overlayID}>
        <BreadcrumbTextContent>
          {overlayID}
        </BreadcrumbTextContent>
      </Breadcrumb>
    );
  }

  return <Page.Header.Breadcrumbs iconID="network" breadcrumbs={crumbs} />;
};

const METHODS_TO_BIND = [
  "onVirtualNetworksStoreError",
  "onVirtualNetworksStoreSuccess"
];

class VirtualNetworkDetail extends mixin(StoreMixin, TabsMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      errorCount: 0,
      receivedVirtualNetworks: false
    };

    // Virtual Network Detail Tabs
    this.tabs_tabs = {
      "/networking/networks/:overlayName": "Tasks",
      "/networking/networks/:overlayName/details": "Details"
    };

    this.store_listeners = [
      {
        name: "virtualNetworks",
        events: ["success", "error"],
        suppressUpdate: true
      }
    ];

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

  updateCurrentTab(nextProps) {
    const { routes } = nextProps || this.props;
    const currentTab = RouterUtil.reconstructPathFromRoutes(routes);

    this.setState({ currentTab });
  }

  onVirtualNetworksStoreError() {
    const errorCount = this.state.errorCount + 1;
    this.setState({ errorCount });
  }

  onVirtualNetworksStoreSuccess() {
    this.setState({ receivedVirtualNetworks: true, errorCount: 0 });
  }

  getErrorScreen() {
    const breadcrumbs = (
      <NetworksDetailBreadcrumbs overlayID={this.props.params.overlayName} />
    );

    return (
      <Page>
        <Page.Header breadcrumbs={breadcrumbs} />
        <RequestErrorMsg />
      </Page>
    );
  }

  getLoadingScreen() {
    const breadcrumbs = (
      <NetworksDetailBreadcrumbs overlayID={this.props.params.overlayName} />
    );

    return (
      <Page>
        <Page.Header breadcrumbs={breadcrumbs} />
        <Loader />
      </Page>
    );
  }

  render() {
    const { currentTab, errorCount, receivedVirtualNetworks } = this.state;

    if (errorCount >= 3) {
      return this.getErrorScreen();
    }

    if (!receivedVirtualNetworks) {
      return this.getLoadingScreen();
    }

    const tabs = [
      {
        label: "Tasks",
        callback: () => {
          this.setState({ currentTab: "/networking/networks/:overlayName" });
          this.context.router.push(
            `/networking/networks/${this.props.params.overlayName}`
          );
        },
        isActive: currentTab === "/networking/networks/:overlayName"
      },
      {
        label: "Details",
        callback: () => {
          this.setState({
            currentTab: "/networking/networks/:overlayName/details"
          });
          this.context.router.push(
            `/networking/networks/${this.props.params.overlayName}/details`
          );
        },
        isActive: currentTab === "/networking/networks/:overlayName/details"
      }
    ];

    const overlay = VirtualNetworksStore.getOverlays().findItem(overlay => {
      return overlay.getName() === this.props.params.overlayName;
    });

    return (
      <Page>
        <Page.Header
          breadcrumbs={<NetworksDetailBreadcrumbs overlay={overlay} />}
          tabs={tabs}
        />
        {React.cloneElement(this.props.children, { overlay })}
      </Page>
    );
  }
}

VirtualNetworkDetail.contextTypes = {
  router: routerShape
};

module.exports = VirtualNetworkDetail;
