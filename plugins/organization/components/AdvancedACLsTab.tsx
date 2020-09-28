import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";

import * as React from "react";
import { routerShape } from "react-router";

import { Table, Tooltip } from "reactjs-components";
import { Icon } from "@dcos/ui-kit";
import {
  greyDark,
  iconSizeXs,
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";

import Loader from "#SRC/js/components/Loader";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import ResourceTableUtil from "#SRC/js/utils/ResourceTableUtil";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import TableUtil from "#SRC/js/utils/TableUtil";

import ACLStore from "../submodules/acl/stores/ACLStore";
import PermissionBuilderModal from "./PermissionBuilderModal";

// This component is extended by Accounts and Groups
class AdvancedACLsTab extends mixin(StoreMixin) {
  static propTypes = {
    itemID: PropTypes.string.isRequired,
  };

  state = {
    aclsRequestErrors: 0,
    aclsRequestSuccess: false,
    aclsToBeCreated: 0,
    aclsToBeCreatedDupes: [],
    aclsToBeCreatedErrors: [],
    aclsToBeCreatedSuccess: 0,
    itemPermissionsRequestErrors: 0,
    itemPermissionsRequestSuccess: false,
    permissionBuilderOpen: false,
    permissionBuilderView: "builder", // [builder, bulk]
  };

  store_listeners = [
    { name: "acl", events: ["fetchResourceSuccess", "fetchResourceError"] },
  ];

  UNSAFE_componentWillMount() {
    ACLStore.fetchACLs();
  }
  handlePermissionBuilderClose = () => {
    this.setState({
      aclsToBeCreated: 0,
      aclsToBeCreatedDupes: [],
      aclsToBeCreatedErrors: [],
      aclsToBeCreatedSuccess: 0,
      permissionBuilderOpen: false,
      permissionBuilderView: "builder",
    });
  };
  handlePermissionBuilderOpen = () => {
    this.setState({ permissionBuilderOpen: true });
  };
  handleBulkAddToggle = () => {
    const newState = {
      aclsToBeCreated: 0,
      aclsToBeCreatedDupes: [],
      aclsToBeCreatedErrors: [],
      aclsToBeCreatedSuccess: 0,
    };

    if (this.state.permissionBuilderView === "builder") {
      newState.permissionBuilderView = "bulk";
    } else {
      newState.permissionBuilderView = "builder";
    }

    this.setState(newState);
  };

  onAclStorePermissionsSuccess() {
    this.setState({
      itemPermissionsRequestSuccess: true,
      itemPermissionsRequestErrors: 0,
    });
  }

  onAclStoreFetchResourceSuccess() {
    this.setState({ aclsRequestSuccess: true, aclsRequestErrors: 0 });
  }

  onAclStoreFetchResourceError() {
    this.setState({ aclsRequestErrors: this.state.aclsRequestErrors + 1 });
  }

  onAclStoreCreateResponse(apiError, isDupe, resourceID, action) {
    const newState = {
      aclsToBeCreated: this.state.aclsToBeCreated - 1,
    };

    if (isDupe) {
      newState.aclsToBeCreatedDupes = this.state.aclsToBeCreatedDupes.concat(
        resourceID
      );
    } else if (apiError) {
      const { aclsToBeCreatedErrors } = this.state;
      newState.aclsToBeCreatedErrors = aclsToBeCreatedErrors.concat([
        {
          error: apiError,
          resourceID,
          action,
        },
      ]);
    } else {
      newState.aclsToBeCreatedSuccess = this.state.aclsToBeCreatedSuccess + 1;
    }

    this.setState(newState);
  }

  onAclStoreRevokeResponse() {
    this.revokeActionsRemaining--;
    if (this.revokeActionsRemaining <= 0) {
      this.forceUpdate();
    }
  }

  handleGroupClick(groupID) {
    this.context.router.push(`/organization/groups/${groupID}`);
  }
  handleFormSubmit = (acls) => {
    this.setState({
      aclsToBeCreated: acls.length,
      aclsToBeCreatedDupes: [],
      aclsToBeCreatedErrors: [],
      aclsToBeCreatedSuccess: 0,
    });
  };

  getColGroup() {
    return (
      <colgroup>
        <col style={{ width: "60%" }} />
        <col />
      </colgroup>
    );
  }

  getActionButtons(actions, acl) {
    let button = (
      <Icon color={greyDark} shape={SystemIcons.Lock} size={iconSizeXs} />
    );

    if (acl.removable) {
      button = (
        <button
          className="button button-small button-danger-link
            table-display-on-row-hover"
          onClick={this.handleActionRevokeClick.bind(
            this,
            acl.rid,
            acl.actions
          )}
        >
          <Trans render="span">Delete</Trans>
        </button>
      );
    }

    return (
      <div className="flex flex-align-items-center">
        <div className="flex-item-grow-1">{actions}</div>
        {button}
      </div>
    );
  }
  renderActions = (prop, acl) => {
    const actions = acl.actions.map((action, i) => {
      let comma = ",";

      if (i === acl.actions.length - 1) {
        comma = "";
      }

      let tooltipContent = "";
      const actionElement = <span>{action}</span>;

      if (acl.removable === false) {
        tooltipContent = (
          <span>
            <Trans render="span">
              Permission inherited from the{" "}
              <a
                className="clickable"
                onClick={this.handleGroupClick.bind(this, acl.gid)}
              >
                {acl.gid}
              </a>{" "}
              group.
            </Trans>
          </span>
        );
      } else {
        tooltipContent = (
          <a
            className="clickable button button-primary-link button-danger"
            onClick={this.handleActionRevokeClick.bind(this, acl.rid, [action])}
          >
            <Trans render="span">Delete Action</Trans>
          </a>
        );
      }

      return (
        <Tooltip
          content={tooltipContent}
          contentClassName="tooltip-content text-align-center text-overflow-break-word"
          interactive={true}
          key={i}
          width={200}
          wrapText={true}
        >
          {actionElement}
          <span>
            {comma}
            &nbsp;
          </span>
        </Tooltip>
      );
    });

    return this.getActionButtons(actions, acl);
  };

  renderID(prop, acl) {
    return <span className="table-cell-emphasized">{acl[prop]}</span>;
  }

  getColumns() {
    const className = ResourceTableUtil.getClassName;
    const descriptionHeading = ResourceTableUtil.renderHeading({
      rid: i18nMark("Resource"),
    });

    return [
      {
        className,
        headerClassName: className,
        prop: "rid",
        sortable: true,
        heading: descriptionHeading,
        render: this.renderID,
      },
      {
        className,
        headerClassName: className,
        prop: "actions",
        render: this.renderActions,
        sortable: false,
        heading: "Actions",
      },
    ];
  }

  render() {
    const {
      aclsRequestErrors,
      aclsRequestSuccess,
      aclsToBeCreated,
      aclsToBeCreatedDupes,
      aclsToBeCreatedErrors,
      aclsToBeCreatedSuccess,
      itemPermissionsRequestErrors,
      itemPermissionsRequestSuccess,
      permissionBuilderOpen,
      permissionBuilderView,
    } = this.state;

    if (aclsRequestErrors >= 3 || itemPermissionsRequestErrors >= 3) {
      return <RequestErrorMsg />;
    }

    if (!aclsRequestSuccess || !itemPermissionsRequestSuccess) {
      return <Loader />;
    }

    return (
      <div>
        <div className="pod pod-shorter flush-top flush-right flush-left text-align-right">
          <button
            className="button button-primary"
            onClick={this.handlePermissionBuilderOpen}
            disabled={aclsToBeCreated.length}
          >
            <Trans render="span">Add Permission</Trans>
          </button>
        </div>
        <PermissionBuilderModal
          activeView={permissionBuilderView}
          disabled={aclsToBeCreated}
          dupesFound={aclsToBeCreatedDupes}
          errors={aclsToBeCreatedErrors}
          handleBulkAddToggle={this.handleBulkAddToggle}
          permissionsAddedCount={aclsToBeCreatedSuccess}
          open={permissionBuilderOpen}
          onClose={this.handlePermissionBuilderClose}
          onSubmit={this.handleFormSubmit}
          subjectID={this.props.itemID}
        />
        <Table
          className="table table-flush table-borderless-outer
            table-borderless-inner-columns table-hover flush-bottom
            table-cell-word-wrap"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          containerSelector=".gm-scroll-view"
          data={this.getACLs()}
          itemHeight={TableUtil.getRowHeight()}
          sortBy={{ prop: "rid", order: "asc" }}
        />
      </div>
    );
  }
}

AdvancedACLsTab.contextTypes = {
  router: routerShape,
};

export default AdvancedACLsTab;
