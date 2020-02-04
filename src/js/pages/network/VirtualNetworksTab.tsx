import { Trans, t } from "@lingui/macro";
import { withI18n, i18nMark } from "@lingui/react";
import mixin from "reactjs-mixin";
import { Link } from "react-router";
import * as React from "react";

import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

import AlertPanel from "../../components/AlertPanel";
import AlertPanelHeader from "../../components/AlertPanelHeader";
import Breadcrumb from "../../components/Breadcrumb";
import BreadcrumbTextContent from "../../components/BreadcrumbTextContent";
import FilterBar from "../../components/FilterBar";
import FilterHeadline from "../../components/FilterHeadline";
import FilterInputText from "../../components/FilterInputText";
import Loader from "../../components/Loader";
import Page from "../../components/Page";
import RequestErrorMsg from "../../components/RequestErrorMsg";
import VirtualNetworksStore from "../../stores/VirtualNetworksStore";
import VirtualNetworksTable from "./VirtualNetworksTable";
import { Overlay } from "src/js/structs/Overlay";

// TODO: maybe abstract to a `searchInProps`?
const getFilteredOverlayList = (overlayList: Overlay[], searchString = "") =>
  searchString === ""
    ? overlayList
    : overlayList.filter(o =>
        [o.name, o.subnet, o.subnet6].some(d => d?.includes(searchString))
      );

const emptyScreen = (
  <AlertPanel>
    <AlertPanelHeader>
      <Trans render="span">No virtual networks detected</Trans>
    </AlertPanelHeader>
    <Trans render="p" className="flush">
      There a currently no other virtual networks found on your datacenter.
      Virtual networks are configured during setup of your DC/OS cluster.
    </Trans>
  </AlertPanel>
);

const NetworksBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Networks">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/networking/networks" />}>Networks</Trans>
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

class VirtualNetworksTabContent extends mixin(StoreMixin) {
  static routeConfig = {
    label: i18nMark("Networks"),
    matches: /^\/networking\/networks/
  };
  constructor(props) {
    super(props);

    this.state = {
      receivedVirtualNetworks: false,
      searchString: "",
      errorCount: 0
    };

    this.store_listeners = [
      { name: "virtualNetworks", events: ["success", "error"] }
    ];
  }

  handleSearchStringChange = (searchString = "") => {
    this.setState({ searchString });
  };

  onVirtualNetworksStoreError = () => {
    const errorCount = this.state.errorCount + 1;
    this.setState({ errorCount });
  };

  onVirtualNetworksStoreSuccess = () => {
    this.setState({ receivedVirtualNetworks: true, errorCount: 0 });
  };

  isLoading() {
    return !this.state.receivedVirtualNetworks;
  }

  resetFilter = () => {
    this.setState({ searchString: "" });
  };

  render() {
    const { errorCount, searchString } = this.state;
    const { i18n } = this.props;
    if (errorCount >= 3) {
      return <RequestErrorMsg />;
    }

    if (this.isLoading()) {
      return <Loader />;
    }

    const overlayList = VirtualNetworksStore.getOverlays();
    const filteredOverlayList = getFilteredOverlayList(
      overlayList,
      searchString
    );

    return filteredOverlayList.length === 0 ? (
      emptyScreen
    ) : (
      <Page>
        <Page.Header breadcrumbs={<NetworksBreadcrumbs />} />
        <div>
          {/* L10NTODO: Pluralize
             We should pluralize FilterHeadline name here using lingui macro instead of
             doing it manually in FilterHeadline */}
          <FilterHeadline
            onReset={this.resetFilter}
            name={i18n._(t`Network`)}
            currentLength={filteredOverlayList.length}
            totalLength={overlayList.length}
          />
          <FilterBar>
            <FilterInputText
              searchString={searchString}
              handleFilterChange={this.handleSearchStringChange}
            />
          </FilterBar>
          <VirtualNetworksTable overlays={filteredOverlayList} />
        </div>
        {this.props.children}
      </Page>
    );
  }
}

export default withI18n()(VirtualNetworksTabContent);
