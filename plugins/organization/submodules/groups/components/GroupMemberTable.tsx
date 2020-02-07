import { i18nMark, withI18n } from "@lingui/react";
import { Trans, t } from "@lingui/macro";
import { Confirm, Table } from "reactjs-components";
import { Link } from "react-router";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import * as React from "react";

import TableUtil from "#SRC/js/utils/TableUtil";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import ResourceTableUtil from "#SRC/js/utils/ResourceTableUtil";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

import ACLGroupStore from "../stores/ACLGroupStore";

class GroupMemberTable extends mixin(StoreMixin) {
  static propTypes = {
    accountType: PropTypes.string.isRequired,
    groupID: PropTypes.string.isRequired
  };
  constructor() {
    super();

    this.state = {
      userID: null,
      openConfirm: false,
      pendingRequest: false,
      requestUsersError: false,
      requestUsersSuccess: false,
      groupUpdateError: null
    };

    // prettier-ignore
    this.store_listeners = [
      {name: "aclGroup", events: ["deleteUserSuccess", "deleteUserError", "usersSuccess", "serviceAccountsSuccess"]}
    ];
  }
  handleOpenConfirm = user => {
    this.setState({
      userID: user.uid,
      openConfirm: true,
      groupUpdateError: null
    });
  };
  handleButtonConfirm = () => {
    this.setState({ pendingRequest: true });
    ACLGroupStore.deleteUser(this.props.groupID, this.state.userID);
  };
  handleButtonCancel = () => {
    this.setState({ openConfirm: false, userID: null });
  };

  onAclGroupStoreDeleteUserError(error) {
    this.setState({ groupUpdateError: error, pendingRequest: false });
  }

  onAclGroupStoreDeleteUserSuccess() {
    this.setState({ openConfirm: false, pendingRequest: false, userID: null });
  }

  onUsersStoreError() {
    this.setState({ requestUsersError: true });
  }

  onUsersStoreSuccess() {
    this.setState({
      requestUsersSuccess: true,
      requestUsersError: false
    });
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{ width: "50%" }} />
        <col />
      </colgroup>
    );
  }

  getColumns() {
    const className = ResourceTableUtil.getClassName;
    const userIDHeading = ResourceTableUtil.renderHeading({
      uid: i18nMark("Username")
    });

    return [
      {
        className,
        headerClassName: className,
        prop: "uid",
        render: this.renderUserLabel,
        sortable: true,
        sortFunction: TableUtil.getSortFunction(
          "uid",
          (item, prop) => item[prop] || item.get(prop)
        ),
        heading: userIDHeading
      },
      {
        className,
        headerClassName: className,
        prop: "remove",
        render: this.renderButton,
        sortable: false,
        heading: ""
      }
    ];
  }

  getConfirmModalContent(groupDetails) {
    const { userID, groupUpdateError } = this.state;
    let userLabel = "This user";
    groupDetails.users.forEach(user => {
      if (user.user.uid === userID) {
        userLabel = user.user.uid;
      }
    });

    const groupLabel = groupDetails.gid;
    let error = null;

    if (groupUpdateError != null) {
      error = <p className="text-error-state">{groupUpdateError}</p>;
    }

    return (
      <div>
        <Trans render="p">
          {userLabel} will be removed from the {groupLabel} group.
        </Trans>
        {error}
      </div>
    );
  }
  renderUserLabel = (prop, user) => {
    let segment = "users";

    if (this.props.accountType === "serviceAccount") {
      segment = "service-accounts";
    }

    return (
      <Link
        className="table-cell-link-primary"
        to={`/organization/${segment}/${user.uid}`}
      >
        {user[prop]}
      </Link>
    );
  };
  renderButton = (prop, user) => {
    return (
      <div className="text-align-right">
        <button
          className="button button-small button-danger-link
          table-display-on-row-hover"
          onClick={this.handleOpenConfirm.bind(this, user)}
        >
          <Trans render="span">Remove</Trans>
        </button>
      </div>
    );
  };

  render() {
    const { accountType, groupID, i18n } = this.props;
    const groupDetails = ACLGroupStore.getGroup(groupID);
    let groupMembers;

    if (accountType === "serviceAccount") {
      groupMembers = ACLGroupStore.getServiceAccounts(groupID).getItems();
    }
    if (accountType === "user") {
      groupMembers = ACLGroupStore.getUsers(groupID);
    }

    const confirmHeading = (
      <ModalHeading>
        <Trans render="span">Are you sure?</Trans>
      </ModalHeading>
    );

    const confirmActionText = this.state.pendingRequest
      ? i18n._(t`Removing...`)
      : i18n._(t`Remove`);

    return (
      <div>
        <Confirm
          disabled={this.state.pendingRequest}
          header={confirmHeading}
          open={this.state.openConfirm}
          onClose={this.handleButtonCancel}
          leftButtonClassName="button button-primary-link flush-left"
          leftButtonCallback={this.handleButtonCancel}
          rightButtonCallback={this.handleButtonConfirm}
          rightButtonClassName="button button-danger"
          rightButtonText={confirmActionText}
          showHeader={true}
        >
          {this.getConfirmModalContent(groupDetails)}
        </Confirm>
        <Table
          className="table table-flush table-borderless-outer table-borderless-inner-columns
            table-hover flush-bottom"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          containerSelector=".gm-scroll-view"
          data={groupMembers}
          itemHeight={TableUtil.getRowHeight()}
          sortBy={{ prop: "uid", order: "asc" }}
        />
      </div>
    );
  }
}

export default withI18n()(GroupMemberTable);
