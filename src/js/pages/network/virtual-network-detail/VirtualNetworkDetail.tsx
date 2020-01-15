import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import { Link, routerShape, RouteComponentProps } from "react-router";
import * as React from "react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Breadcrumb from "../../../components/Breadcrumb";
import BreadcrumbTextContent from "../../../components/BreadcrumbTextContent";
import Loader from "../../../components/Loader";
import Page from "../../../components/Page";
import RequestErrorMsg from "../../../components/RequestErrorMsg";
import VirtualNetworksActions from "#SRC/js/events/VirtualNetworksActions";
import { Overlay } from "#SRC/js/structs/Overlay";

const NetworksDetailBreadcrumbs = (name: string) => (
  <Page.Header.Breadcrumbs
    iconID={ProductIcons.Network}
    breadcrumbs={[
      <Breadcrumb key={0} title="Networks">
        <BreadcrumbTextContent>
          <Trans render={<Link to="/networking/networks" />}>Networks</Trans>
        </BreadcrumbTextContent>
      </Breadcrumb>,

      <Breadcrumb key={1} title={name}>
        <BreadcrumbTextContent>
          <Link to={`/networking/networks/${name}/tasks`}>{name}</Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    ]}
  />
);

export default class VirtualNetworkDetail extends React.Component<
  RouteComponentProps<{ overlayName: string }, any>
> {
  static contextTypes = { router: routerShape };

  state: {
    errorCount: number;
    virtualNetworks: Overlay[] | null;
  } = {
    errorCount: 0,
    virtualNetworks: null
  };

  componentDidMount() {
    VirtualNetworksActions.fetch(
      virtualNetworks => void this.setState({ virtualNetworks }),
      _ => void this.setState({ errorCount: 3 })
    );
  }

  getBreadCrumbs = () =>
    NetworksDetailBreadcrumbs(this.props.params.overlayName);

  getErrorScreen() {
    return (
      <Page>
        <Page.Header breadcrumbs={this.getBreadCrumbs()} />
        <RequestErrorMsg />
      </Page>
    );
  }

  render() {
    const { errorCount, virtualNetworks } = this.state;
    const { overlayName } = this.props.params;

    if (errorCount >= 3) {
      return this.getErrorScreen();
    }

    const prefix = `/networking/networks/${overlayName}`;
    const tabs = [
      { label: i18nMark("Tasks"), routePath: `${prefix}/tasks` },
      { label: i18nMark("Details"), routePath: `${prefix}/details` }
    ];

    return (
      <Page>
        <Page.Header
          breadcrumbs={this.getBreadCrumbs()}
          tabs={virtualNetworks === null ? [] : tabs}
        />

        {virtualNetworks === null ? (
          <Loader />
        ) : (
          React.cloneElement(this.props.children, {
            overlay: virtualNetworks.find(_ => _.name === overlayName)
          })
        )}
      </Page>
    );
  }
}
