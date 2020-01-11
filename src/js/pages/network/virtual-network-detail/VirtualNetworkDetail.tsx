import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import mixin from "reactjs-mixin";
import { Link, routerShape } from "react-router";
import * as React from "react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import StoreMixin from "#SRC/js/mixins/StoreMixin";
import Breadcrumb from "../../../components/Breadcrumb";
import BreadcrumbTextContent from "../../../components/BreadcrumbTextContent";
import Loader from "../../../components/Loader";
import Page from "../../../components/Page";
import RequestErrorMsg from "../../../components/RequestErrorMsg";
import VirtualNetworksStore from "../../../stores/VirtualNetworksStore";

const NetworksDetailBreadcrumbs = ({ overlayID, overlay }) => {
  const crumbs = [
    <Breadcrumb key={0} title="Networks">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/networking/networks" />}>Networks</Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  if (overlay) {
    const { name } = overlay;
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
        <BreadcrumbTextContent>{overlayID}</BreadcrumbTextContent>
      </Breadcrumb>
    );
  }

  return (
    <Page.Header.Breadcrumbs
      iconID={ProductIcons.Network}
      breadcrumbs={crumbs}
    />
  );
};

export default class VirtualNetworkDetail extends mixin(StoreMixin) {
  static contextTypes = { router: routerShape };

  constructor(...args) {
    super(...args);

    this.state = {
      errorCount: 0,
      receivedVirtualNetworks: false
    };

    // prettier-ignore
    this.store_listeners = [
      { name: "virtualNetworks", events: ["success", "error"], suppressUpdate: true }
    ];
  }

  onVirtualNetworksStoreError = () => {
    const errorCount = this.state.errorCount + 1;
    this.setState({ errorCount });
  };

  onVirtualNetworksStoreSuccess = () => {
    this.setState({ receivedVirtualNetworks: true, errorCount: 0 });
  };

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

  render() {
    const { errorCount, receivedVirtualNetworks } = this.state;

    if (errorCount >= 3) {
      return this.getErrorScreen();
    }

    if (!receivedVirtualNetworks) {
      return (
        <Page>
          <Page.Header
            breadcrumbs={
              <NetworksDetailBreadcrumbs
                overlayID={this.props.params.overlayName}
              />
            }
          />
          <Loader />
        </Page>
      );
    }

    const prefix = `/networking/networks/${this.props.params.overlayName}`;

    const tabs = [
      { label: i18nMark("Tasks"), routePath: prefix },
      { label: i18nMark("Details"), routePath: `${prefix}/details` }
    ];

    const overlay = VirtualNetworksStore.getOverlays().find(
      ({ name }) => name === this.props.params.overlayName
    );

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
