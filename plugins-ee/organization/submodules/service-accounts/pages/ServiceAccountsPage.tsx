import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import mixin from "reactjs-mixin";
import { Link } from "react-router";
import PropTypes from "prop-types";
import * as React from "react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import Loader from "#SRC/js/components/Loader";
import Page from "#SRC/js/components/Page";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

import getACLServiceAccountsStore from "../stores/ACLServiceAccountsStore";
import OrganizationTab from "../../../components/OrganizationTab";
import ServiceAccountDetailPage from "../components/ServiceAccountDetailPage";
import ServiceAccountsFormModal from "../components/ServiceAccountsFormModal";

const ACLServiceAccountsStore = getACLServiceAccountsStore();

const ServiceAccountsBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Service Accounts">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/organization/service-accounts" />}>
          Service Accounts
        </Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return (
    <Page.Header.Breadcrumbs iconID={ProductIcons.Users} breadcrumbs={crumbs} />
  );
};

export default class ServiceAccountsPage extends mixin(StoreMixin) {
  static routeConfig = {
    label: i18nMark("Service Accounts"),
    matches: /^\/organization\/service-accounts/
  };
  static propTypes = {
    params: PropTypes.object
  };
  constructor(...args) {
    super(...args);

    this.store_listeners = [
      { name: "marathon", events: ["success"] },
      { name: "aclServiceAccounts", events: ["change", "error"] }
    ];

    this.state = {
      serviceAccountsStoreError: false,
      serviceAccountsStoreSuccess: false,
      openNewGroupModal: false
    };
  }

  componentDidMount() {
    super.componentDidMount();
    ACLServiceAccountsStore.fetchAll();
  }
  onAclServiceAccountsStoreChange = () => {
    this.setState({
      serviceAccountsStoreError: false,
      serviceAccountsStoreSuccess: true
    });
  };
  onAclServiceAccountsStoreError = () => {
    this.setState({
      serviceAccountsStoreError: true,
      serviceAccountsStoreSuccess: false
    });
  };
  handleNewGroupClick = () => {
    this.setState({ openNewGroupModal: true });
  };
  handleNewGroupClose = () => {
    this.setState({ openNewGroupModal: false });
  };

  getContents() {
    if (this.state.serviceAccountsStoreError) {
      return <RequestErrorMsg />;
    }

    if (!this.state.serviceAccountsStoreSuccess) {
      return <Loader />;
    }

    const items = ACLServiceAccountsStore.getServiceAccounts().getItems();

    return (
      <OrganizationTab
        routes={this.props.routes}
        params={this.props.params}
        items={items}
        itemID="uid"
        itemName="serviceAccount"
      />
    );
  }

  render() {
    const { params, routes } = this.props;

    if (params && "serviceAccountID" in params) {
      return <ServiceAccountDetailPage params={params} routes={routes} />;
    }

    return (
      <Page>
        <Page.Header
          breadcrumbs={<ServiceAccountsBreadcrumbs />}
          addButton={{
            label: i18nMark("New Service Account"),
            onItemSelect: this.handleNewGroupClick
          }}
        />
        {this.getContents()}
        <ServiceAccountsFormModal
          open={this.state.openNewGroupModal}
          onClose={this.handleNewGroupClose}
        />
      </Page>
    );
  }
}
