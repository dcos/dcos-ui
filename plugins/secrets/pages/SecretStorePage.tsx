import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import mixin from "reactjs-mixin";
import { Link } from "react-router";
import * as React from "react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import FilterHeadline from "#SRC/js/components/FilterHeadline";
import Loader from "#SRC/js/components/Loader";
import Page from "#SRC/js/components/Page";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

import getSecretStore from "../stores/SecretStore";
import SecretStoresTable from "../components/SecretStoresTable";

const SecretStore = getSecretStore();

const SecretStoreBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Secret Stores">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/settings/stores" />}>Secret Stores</Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>,
  ];

  return (
    <Page.Header.Breadcrumbs iconID={ProductIcons.Gear} breadcrumbs={crumbs} />
  );
};

class SecretStorePage extends mixin(StoreMixin) {
  state = { requestError: false };

  store_listeners = [
    { name: "secrets", events: ["storesSuccess", "storesError"] },
  ];

  componentDidMount() {
    super.componentDidMount();
    SecretStore.fetchStores();
  }

  onSecretsStoreStoresSuccess() {
    this.setState({ requestError: false });
  }

  onSecretsStoreStoresError() {
    this.setState({ requestError: true });
  }

  getRequestErrorMsg() {
    return (
      <Page>
        <Page.Header breadcrumbs={<SecretStoreBreadcrumbs />} />
        <RequestErrorMsg />
      </Page>
    );
  }

  render() {
    const stores = SecretStore.getStores();
    const storeCount = stores.length;
    if (this.state.requestError) {
      return this.getRequestErrorMsg();
    }

    if (storeCount === 0) {
      return (
        <Page>
          <Page.Header breadcrumbs={<SecretStoreBreadcrumbs />} />
          <Loader />
        </Page>
      );
    }

    return (
      <Page>
        <Page.Header breadcrumbs={<SecretStoreBreadcrumbs />} />
        <FilterHeadline
          onReset={() => {}}
          name="Secret Store"
          currentLength={storeCount}
          totalLength={storeCount}
        />
        <SecretStoresTable stores={stores} />
      </Page>
    );
  }
}

SecretStorePage.routeConfig = {
  label: i18nMark("Secret Stores"),
  matches: /^\/settings\/stores/,
};

export default SecretStorePage;
