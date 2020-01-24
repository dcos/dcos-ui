import { i18nMark, withI18n } from "@lingui/react";
import { Trans, t } from "@lingui/macro";
import { Confirm } from "reactjs-components";
import { Link, routerShape } from "react-router";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import * as React from "react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import Loader from "#SRC/js/components/Loader";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import Page from "#SRC/js/components/Page";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import UserActions from "#SRC/js/constants/UserActions";
import Util from "#SRC/js/utils/Util";

import ACLGroupStore from "../stores/ACLGroupStore";
import GroupAccountMembershipTab from "./GroupAccountMembershipTab";
import GroupAdvancedACLsTab from "./GroupAdvancedACLsTab";

const GroupDetailBreadcrumbs = ({ groupID }) => {
  const crumbs = [
    <Breadcrumb key={0} title="Groups">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/organization/groups" />}>Groups</Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>,
    <Breadcrumb key={1} title="Groups">
      <BreadcrumbTextContent>
        <Link to={`/organization/groups/${groupID}`}>{groupID}</Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return (
    <Page.Header.Breadcrumbs iconID={ProductIcons.Users} breadcrumbs={crumbs} />
  );
};

class GroupDetailPage extends mixin(StoreMixin) {
  constructor(...args) {
    super(...args);

    this.state = {
      currentTab: "advancedACLs",
      deleteUpdateError: null,
      fetchedDetailsError: false,
      openDeleteConfirmation: false,
      pendingRequest: false
    };

    // prettier-ignore
    this.store_listeners = [
      {name: "acl", events: ["groupGrantSuccess", "groupRevokeSuccess"]},
      {name: "aclGroup", events: ["addUserSuccess", "deleteUserSuccess", "fetchedDetailsSuccess", "fetchedDetailsError", "deleteSuccess", "deleteError"], suppressUpdate: true},
      {name: "summary", events: ["success"], unmountWhen: (store, event) => event === "success" && store.get("statesProcessed") }
    ];

    // Debounce onACLChange as sometimes it may get called too frequently.
    // For example, when adding bulk permissions
    this.onACLChange = Util.debounce(() => {
      ACLGroupStore.fetchGroupWithDetails(this.props.params.groupID);
    }, 300);
  }

  componentDidMount(...args) {
    super.componentDidMount(...args);

    ACLGroupStore.fetchGroupWithDetails(this.props.params.groupID);
  }
  handleDeleteCancel = () => {
    this.setState({
      openDeleteConfirmation: false
    });
  };
  handleDeleteModalOpen = () => {
    this.setState({
      deleteUpdateError: null,
      openDeleteConfirmation: true
    });
  };
  handleDeleteGroup = () => {
    this.setState({
      pendingRequest: true
    });
    ACLGroupStore.deleteGroup(this.props.params.groupID);
  };

  onAclStoreGroupGrantSuccess() {
    this.onACLChange();
  }

  onAclStoreGroupRevokeSuccess() {
    this.onACLChange();
  }

  onAclGroupStoreAddUserSuccess() {
    this.onACLChange();
  }

  onAclGroupStoreDeleteUserSuccess() {
    this.onACLChange();
  }

  onAclGroupStoreDeleteError(error) {
    this.setState({
      deleteUpdateError: error,
      pendingRequest: false
    });
  }

  onAclGroupStoreDeleteSuccess() {
    this.setState({
      openDeleteConfirmation: false,
      pendingRequest: false
    });

    this.context.router.push("/organization/groups");
  }

  onAclGroupStoreFetchedDetailsSuccess() {
    if (this.state.fetchedDetailsError) {
      this.setState({ fetchedDetailsError: false });
    } else {
      this.forceUpdate();
    }
  }

  onAclGroupStoreFetchedDetailsError(groupID) {
    if (groupID === this.props.params.groupID) {
      this.setState({ fetchedDetailsError: true });
    } else {
      this.forceUpdate();
    }
  }

  getDeleteModalContent() {
    let error = null;

    if (this.state.deleteUpdateError != null) {
      error = (
        <p className="text-error-state">{this.state.deleteUpdateError}</p>
      );
    }

    const group = ACLGroupStore.getGroup(this.props.params.groupID);

    return (
      <div>
        <p>{`${group.gid} will be ${UserActions.DELETED}.`}</p>
        {error}
      </div>
    );
  }

  getErrorNotice() {
    return (
      <Page>
        <Page.Header
          breadcrumbs={
            <GroupDetailBreadcrumbs groupID={this.props.params.groupID} />
          }
        />
        <RequestErrorMsg />
      </Page>
    );
  }

  render() {
    const { i18n, params } = this.props;

    const groupID = params.groupID;
    const group = ACLGroupStore.getGroup(groupID);

    if (this.state.fetchedDetailsError) {
      return this.getErrorNotice();
    }

    if (group.get("gid") == null) {
      return (
        <Page>
          <Page.Header
            breadcrumbs={
              <GroupDetailBreadcrumbs groupID={this.props.params.groupID} />
            }
          />
          <Loader />
        </Page>
      );
    }

    const confirmHeading = (
      <ModalHeading>
        <Trans render="span">Are you sure?</Trans>
      </ModalHeading>
    );

    const { currentTab } = this.state;
    const tabs = [
      {
        label: i18nMark("Permissions"),
        callback: () => {
          this.setState({ currentTab: "advancedACLs" });
        },
        isActive: currentTab === "advancedACLs"
      },
      {
        label: i18nMark("Users"),
        callback: () => {
          this.setState({ currentTab: "users" });
        },
        isActive: currentTab === "users"
      },
      {
        label: i18nMark("Service Accounts"),
        callback: () => {
          this.setState({ currentTab: "serviceAccounts" });
        },
        isActive: currentTab === "serviceAccounts"
      }
    ];
    const deleteActionText = this.state.pendingRequest
      ? i18n._(t`Deleting...`)
      : i18n._(t`Delete`);

    return (
      <Page>
        <Page.Header
          actions={[
            {
              className: "text-danger",
              label: i18nMark("Delete"),
              onItemSelect: this.handleDeleteModalOpen
            }
          ]}
          breadcrumbs={<GroupDetailBreadcrumbs groupID={group.get("gid")} />}
          tabs={tabs}
        />
        <div className="flex-container-col">
          {this.state.currentTab === "advancedACLs" ? (
            <GroupAdvancedACLsTab itemID={groupID} />
          ) : this.state.currentTab === "users" ? (
            <GroupAccountMembershipTab accountType="user" groupID={groupID} />
          ) : this.state.currentTab === "serviceAccounts" ? (
            <GroupAccountMembershipTab
              accountType="serviceAccount"
              groupID={groupID}
            />
          ) : null}

          <Confirm
            closeByBackdropClick={true}
            disabled={this.state.pendingRequest}
            header={confirmHeading}
            open={this.state.openDeleteConfirmation}
            onClose={this.handleDeleteCancel}
            leftButtonCallback={this.handleDeleteCancel}
            leftButtonClassName="button button-primary-link flush-left"
            rightButtonCallback={this.handleDeleteGroup}
            rightButtonClassName="button button-danger"
            rightButtonText={deleteActionText}
            showHeader={true}
          >
            {this.getDeleteModalContent()}
          </Confirm>
        </div>
      </Page>
    );
  }
}

GroupDetailPage.contextTypes = {
  router: routerShape,
  groupID: PropTypes.string
};

export default withI18n()(GroupDetailPage);
