import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import { Confirm, Table } from "reactjs-components";
import { Link } from "react-router";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import * as React from "react";

import TableUtil from "#SRC/js/utils/TableUtil";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import ResourceTableUtil from "#SRC/js/utils/ResourceTableUtil";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

import ACLGroupStore from "../submodules/groups/stores/ACLGroupStore";

class AccountGroupTable extends mixin(StoreMixin) {
  static propTypes = {
    getAccountDetails: PropTypes.func.isRequired
  };
  constructor() {
    super();

    this.state = {
      groupID: null,
      openConfirm: false,
      pendingRequest: false,
      requestGroupsSuccess: false,
      requestGroupsError: false,
      userUpdateError: null
    };

    // prettier-ignore
    this.store_listeners = [
      { name: "aclGroup", events: ["deleteUserSuccess", "deleteUserError", "usersSuccess"] }
    ];
  }

  handleOpenConfirm = group => {
    this.setState({
      groupID: group.gid,
      openConfirm: true,
      userUpdateError: null
    });
  };

  handleButtonConfirm = () => {
    ACLGroupStore.deleteUser(this.state.groupID, this.props.accountID);
    this.setState({ pendingRequest: true });
  };

  handleButtonCancel = () => {
    this.setState({ groupID: null, openConfirm: false });
  };

  onAclGroupStoreDeleteUserError(error) {
    this.setState({ pendingRequest: false, userUpdateError: error });
  }

  onAclGroupStoreDeleteUserSuccess() {
    this.setState({ groupID: null, openConfirm: false, pendingRequest: false });
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
    const groupIDHeading = ResourceTableUtil.renderHeading({
      gid: i18nMark("Group ID")
    });

    return [
      {
        className,
        headerClassName: className,
        prop: "gid",
        render: this.renderGroupLabel,
        sortable: true,
        sortFunction: TableUtil.getSortFunction(
          "gid",
          (item, prop) => item[prop] || item.get(prop)
        ),
        heading: groupIDHeading
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

  getConfirmModalContent(accountDetails) {
    const { groupID, userUpdateError } = this.state;
    let groupLabel = "this group";
    accountDetails.groups.forEach(group => {
      if (group.group.gid === groupID) {
        groupLabel = group.group.gid;
      }
    });

    const userName = accountDetails.uid;
    let error = null;

    if (userUpdateError != null) {
      error = <p className="text-error-state">{userUpdateError}</p>;
    }

    return (
      <div>
        <Trans render="p">
          {userName} will be removed from {groupLabel}.
        </Trans>
        {error}
      </div>
    );
  }

  renderGroupLabel(prop, group) {
    return (
      <Link
        className="table-cell-link-primary"
        to={`/organization/groups/${group.gid}`}
      >
        {group[prop]}
      </Link>
    );
  }

  renderButton = (prop, group) => {
    return (
      <div className="text-align-right">
        <button
          className="button button-small button-danger-link
          table-display-on-row-hover"
          onClick={this.handleOpenConfirm.bind(this, group)}
        >
          <Trans render="span">Remove</Trans>
        </button>
      </div>
    );
  };

  render() {
    const accountDetails = this.props.getAccountDetails();
    const userGroups = accountDetails.groups.map(group => group.group);

    const confirmHeading = (
      <ModalHeading>
        <Trans render="span">Are you sure?</Trans>
      </ModalHeading>
    );

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
          showHeader={true}
        >
          {this.getConfirmModalContent(accountDetails)}
        </Confirm>
        <Table
          className="table table-flush table-borderless-outer
            table-borderless-inner-columns table-hover
            flush-bottom"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          containerSelector=".gm-scroll-view"
          data={userGroups}
          itemHeight={TableUtil.getRowHeight()}
          sortBy={{ prop: "gid", order: "asc" }}
        />
      </div>
    );
  }
}

export default AccountGroupTable;
