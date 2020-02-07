import { Trans } from "@lingui/macro";
import { Link } from "react-router";

import * as React from "react";

import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import Page from "#SRC/js/components/Page";

import AccountAdvancedACLsTab from "../../../components/AccountAdvancedACLsTab";
import AccountDetailPage from "../../../components/AccountDetailPage";
import ACLServiceAccountActions from "../actions/ACLServiceAccountActions";
import getACLServiceAccountsStore from "../stores/ACLServiceAccountsStore";
import ServiceAccountsFormModal from "./ServiceAccountsFormModal";

const ACLServiceAccountsStore = getACLServiceAccountsStore();

class ServiceAccountDetailPage extends AccountDetailPage {
  constructor(...args) {
    super(...args);

    // prettier-ignore
    this.store_listeners.push({name: "aclServiceAccounts", events: ["deleteSuccess", "deleteError", "fetchedDetailsSuccess", "fetchedDetailsError", "fetchSuccess", "updateSuccess"], suppressUpdate: true});
  }

  componentDidMount() {
    super.componentDidMount();

    ACLServiceAccountsStore.fetchServiceAccountWithDetails(this.getAccountID());
  }

  onACLChange() {
    ACLServiceAccountsStore.fetchServiceAccountWithDetails(this.getAccountID());
  }

  onAclServiceAccountsStoreFetchedDetailsSuccess() {
    if (this.state.fetchedDetailsError === true) {
      this.setState({ fetchedDetailsError: false });
    } else {
      this.forceUpdate();
    }
  }

  onAclServiceAccountsStoreFetchedDetailsError(serviceAccountID) {
    if (serviceAccountID === this.getAccountID()) {
      this.setState({ fetchedDetailsError: true });
    } else {
      this.forceUpdate();
    }
  }

  onAclServiceAccountsStoreFetchSuccess() {
    this.forceUpdate();
  }

  onAclServiceAccountsStoreDeleteError(error) {
    this.setState({
      deleteUpdateError: error,
      pendingRequest: false
    });
  }

  onAclServiceAccountsStoreDeleteSuccess() {
    this.setState({
      openDeleteConfirmation: false,
      pendingRequest: false
    });

    this.context.router.push("/organization/service-accounts");
  }

  onAclServiceAccountsStoreUpdateSuccess() {
    ACLServiceAccountsStore.fetch(this.getAccountID());
  }
  handleEditAccount = model => {
    ACLServiceAccountsStore.update(this.getAccountID(), model);
  };

  deleteAccount() {
    ACLServiceAccountsStore.delete(this.getAccountID());
  }

  getBreadcrumbs() {
    const account = this.getAccount();
    let accountID = this.getAccountID();
    let title = accountID;

    if (account) {
      title = account.getDescription();
      accountID = account.getID();

      if (account.isRemote && account.isRemote()) {
        title = account.getID();
      }
    }

    const crumbs = [
      <Breadcrumb key={0} title="Service Accounts">
        <BreadcrumbTextContent>
          <Trans render={<Link to="/organization/service-accounts" />}>
            Service Accounts
          </Trans>
        </BreadcrumbTextContent>
      </Breadcrumb>,
      <Breadcrumb key={1} title={title}>
        <BreadcrumbTextContent>
          <Link to={`/organization/service-accounts/${accountID}`}>
            {title}
          </Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    ];

    return (
      <Page.Header.Breadcrumbs
        iconID={ProductIcons.Users}
        breadcrumbs={crumbs}
      />
    );
  }
  getAccount = () => {
    return ACLServiceAccountsStore.getServiceAccount(this.getAccountID());
  };

  getAccountID() {
    return this.props.params.serviceAccountID;
  }
  fetchPermissions = () => {
    ACLServiceAccountActions.fetchPermissions(this.getAccountID());
  };

  renderPermissionsTabView() {
    return (
      <AccountAdvancedACLsTab
        fetchPermissions={this.fetchPermissions}
        getAccountDetails={this.getAccount}
        itemID={this.getAccountID()}
        storeListenerName="aclServiceAccounts"
      />
    );
  }

  renderEditFormModal() {
    return (
      <ServiceAccountsFormModal
        open={this.state.openEditFormModal}
        onClose={this.handleEditCancel}
        onSubmit={this.handleEditAccount}
        account={this.getAccount()}
      />
    );
  }
}

export default ServiceAccountDetailPage;
