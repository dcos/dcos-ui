import { Trans } from "@lingui/macro";
import { Link, routerShape } from "react-router";
import mixin from "reactjs-mixin";
import * as React from "react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";
import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import FilterHeadline from "#SRC/js/components/FilterHeadline";
import FilterInputText from "#SRC/js/components/FilterInputText";
import Loader from "#SRC/js/components/Loader";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import Page from "#SRC/js/components/Page";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import Util from "#SRC/js/utils/Util";

import NetworkingVIPSummariesStore from "../stores/NetworkingVIPSummariesStore";
import VIPsTable from "../components/VIPsTable";

const LoadBalancingBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Service Addresses">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/networking/service-addresses" />}>
          Service Addresses
        </Trans>
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

class LoadBalancingTabContent extends mixin(StoreMixin) {
  state = {
    receivedVIPSummaries: false,
    searchString: "",
    vipSummariesErrorCount: 0,
  };

  store_listeners = [
    { name: "networkingVIPSummaries", events: ["success", "error"] },
  ];

  componentDidMount() {
    super.componentDidMount();
    NetworkingVIPSummariesStore.startFetchVIPSummaries();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    NetworkingVIPSummariesStore.stopFetchVIPSummaries();
  }
  onNetworkingVIPSummariesStoreError = () => {
    const vipSummariesErrorCount = this.state.vipSummariesErrorCount + 1;
    this.setState({ vipSummariesErrorCount });
  };
  onNetworkingVIPSummariesStoreSuccess = () => {
    this.setState({ receivedVIPSummaries: true, vipSummariesErrorCount: 0 });
  };

  getEmptyLoadBalancingContent() {
    return (
      <AlertPanel>
        <AlertPanelHeader>
          <Trans render="span">No Service Addresses detected</Trans>
        </AlertPanelHeader>
        <Trans render="p" className="flush">
          For information and instructions on how to create virtual IPs see{" "}
          <a
            href={MetadataStore.buildDocsURI(
              "/networking/load-balancing-vips/virtual-ip-addresses"
            )}
            target="_blank"
          >
            networking documentation
          </a>
          .
        </Trans>
      </AlertPanel>
    );
  }

  getErrorScreen() {
    return <RequestErrorMsg />;
  }

  getFilteredVIPSummaries(vipSummaries, searchString = "") {
    if (searchString === "") {
      return vipSummaries;
    }

    return vipSummaries.filter((vipSummary) => {
      const name = Util.findNestedPropertyInObject(vipSummary, "fullVIP.name");
      const port = Util.findNestedPropertyInObject(vipSummary, "fullVIP.port");

      return (
        vipSummary.vip.indexOf(searchString) > -1 ||
        (name && name.indexOf(searchString) > -1) ||
        (port && typeof port === "string" && port.indexOf(searchString) > -1)
      );
    });
  }

  getLoadBalancingContent() {
    const vipSummaries = this.getVIPSummaries();
    const filteredVIPSummaries = this.getFilteredVIPSummaries(
      vipSummaries,
      this.state.searchString
    );

    if (vipSummaries.length === 0) {
      return this.getEmptyLoadBalancingContent();
    }

    return (
      <div>
        <div className="row row-flex row-flex-align-vertical-bottom">
          <div className="column-6">
            <FilterHeadline
              onReset={this.resetFilter}
              name="Service Address"
              currentLength={filteredVIPSummaries.length}
              totalLength={vipSummaries.length}
            />
            <ul className="list list-unstyled list-inline flush-bottom">
              <li>
                <FilterInputText
                  searchString={this.state.searchString}
                  handleFilterChange={this.handleSearchStringChange}
                />
              </li>
            </ul>
          </div>
          <div className="column-6 text-align-right text-super-muted">
            <Trans render="div" className="form-group">
              All stats are for the past minute
            </Trans>
          </div>
        </div>
        <VIPsTable vips={filteredVIPSummaries} />
      </div>
    );
  }

  getVIPSummaries() {
    const vipSummaries = NetworkingVIPSummariesStore.getVIPSummaries().getItems();

    return vipSummaries.map((vipSummary) => ({
      name: vipSummary.getName(),
      fullVIP: vipSummary.getVIP(),
      vip: vipSummary.getVIPString(),
      successLastMinute: vipSummary.getSuccessLastMinute(),
      failLastMinute: vipSummary.getFailLastMinute(),
      failurePercent: vipSummary.getFailPercent(),
      applicationReachabilityPercent: vipSummary.getApplicationReachabilityPercent(),
      machineReachabilityPercent: vipSummary.getMachineReachabilityPercent(),
      p99Latency: vipSummary.getP99Latency(),
    }));
  }
  handleSearchStringChange = (searchString = "") => {
    this.setState({ searchString });
  };

  isLoading() {
    return !this.state.receivedVIPSummaries;
  }
  resetFilter = () => {
    this.setState({ searchString: "" });
  };

  render() {
    let content = null;

    if (this.state.vipSummariesErrorCount >= 1) {
      content = this.getErrorScreen();
    } else if (this.isLoading()) {
      content = <Loader />;
    } else {
      content = <div>{this.getLoadBalancingContent()}</div>;
    }

    return (
      <Page>
        <Page.Header breadcrumbs={<LoadBalancingBreadcrumbs />} />
        {content}
        {this.props.children}
      </Page>
    );
  }
}

LoadBalancingTabContent.contextTypes = {
  router: routerShape,
};

export default LoadBalancingTabContent;
