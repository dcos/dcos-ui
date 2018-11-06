import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import { routerShape, Link } from "react-router";
import mixin from "reactjs-mixin";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { Hooks } from "PluginSDK";

import Breadcrumb from "../components/Breadcrumb";
import BreadcrumbTextContent from "../components/BreadcrumbTextContent";
import Icon from "../components/Icon";
import Loader from "../components/Loader";
import Page from "../components/Page";
import SidebarActions from "../events/SidebarActions";
import TabsMixin from "../mixins/TabsMixin";

const NetworkingBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Networks">
      <BreadcrumbTextContent>
        <Link to="/networking">
          <Trans render="span">Networks</Trans>
        </Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return <Page.Header.Breadcrumbs iconID="networking" breadcrumbs={crumbs} />;
};

class NetworkPage extends mixin(TabsMixin) {
  constructor() {
    super(...arguments);
    this.state = {};
  }

  componentWillMount() {
    super.componentWillMount(...arguments);

    const networkPageReady = Hooks.applyFilter(
      "networkPageReady",
      Promise.resolve({ isReady: true })
    );

    if (!networkPageReady.isReady) {
      // Set page ready once promise resolves
      networkPageReady.then(() => {
        this.setState({ networkPageReady: true });
      });
    }

    this.setState({ networkPageReady: networkPageReady.isReady });
  }

  render() {
    if (!this.state.networkPageReady) {
      return (
        <Page>
          <Page.Header breadcrumbs={<NetworkingBreadcrumbs />} />
          <Loader />
        </Page>
      );
    }

    return this.props.children;
  }
}

NetworkPage.contextTypes = {
  router: routerShape
};

NetworkPage.routeConfig = {
  label: i18nMark("Networking"),
  icon: <Icon id="networking-inverse" size="small" family="product" />,
  matches: /^\/networking/
};

NetworkPage.willTransitionTo = function() {
  SidebarActions.close();
};

module.exports = NetworkPage;
