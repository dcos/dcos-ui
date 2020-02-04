import Util from "#SRC/js/utils/Util";
import ACLStore from "../../acl/stores/ACLStore";
import ACLGroupsActions from "../actions/ACLGroupsActions";
import ACLGroupStore from "../stores/ACLGroupStore";
import AdvancedACLsTab from "../../../components/AdvancedACLsTab";

export default class GroupAdvancedACLsTab extends AdvancedACLsTab {
  constructor(...args) {
    super(...args);

    this.store_listeners[0].events.push(
      "createError",
      "groupGrantSuccess",
      "groupGrantError",
      "groupRevokeSuccess",
      "groupRevokeError"
    );
    // prettier-ignore
    this.store_listeners.push({name: "aclGroup", events: ["permissionsSuccess", "permissionsError"]});

    // When revoking an ACL to the resource,
    // we want both of these events to do the same thing.
    this.onAclStoreGroupRevokeSuccess = this.onAclStoreRevokeResponse.bind(
      this
    );
    this.onAclStoreGroupRevokeError = this.onAclStoreRevokeResponse.bind(this);
    // When we receive the Principal's permissions then call child
    this.onAclGroupStorePermissionsSuccess = this.onAclStorePermissionsSuccess.bind(
      this
    );

    // Debounce fetchPermissions as sometimes it may get called too frequently.
    // For example, when adding bulk permissions
    this.fetchPermissionsDebounced = Util.debounce(() => {
      ACLGroupsActions.fetchGroupPermissions(this.props.itemID);
    }, 500);

    this.revokeActionsRemaining = 0;
  }

  UNSAFE_componentWillMount() {
    super.UNSAFE_componentWillMount();
    ACLGroupsActions.fetchGroupPermissions(this.props.itemID);
  }

  /**
   * Called when creating an ACL fails. This is before we attempt to grant an
   * ACL to a user.
   * @param  {String} apiError An API error
   * @param  {String} resourceID The rid `foo:bar:baz`
   */
  onAclStoreCreateError(apiError, resourceID) {
    this.onAclStoreCreateResponse(apiError, false, resourceID);
  }

  onAclStoreGroupGrantSuccess({ resourceID, action }) {
    this.fetchPermissionsDebounced();
    // false, false - means there's no errors and it's not a dupe
    this.onAclStoreCreateResponse(false, false, resourceID, action);
  }

  onAclStoreGroupGrantError(apiError, { resourceID, action }, xhr) {
    let isDupe = false;

    if (xhr.status === 409) {
      isDupe = true;
    }

    this.onAclStoreCreateResponse(apiError, isDupe, resourceID, action);
  }

  onAclStoreFetchResourceError(...args) {
    super.onAclStoreFetchResourceError(...args);
    ACLGroupsActions.fetchGroupPermissions(this.props.itemID);
  }

  onAclGroupStorePermissionsError() {
    ACLGroupsActions.fetchGroupPermissions(this.props.itemID);
    this.setState({
      itemPermissionsRequestErrors: this.state.itemPermissionsRequestErrors + 1
    });
  }
  handleFormSubmit = acls => {
    const { itemID } = this.props;
    acls.forEach(({ actions, resource }) => {
      ACLStore.grantGroupActionToResource(itemID, actions, resource);
    });
    super.handleFormSubmit(...arguments);
  };

  /**
   * Handles revoking an action
   *
   * @param  {Number} resourceID A resource ID
   * @param  {Array} actions A list of actions
   */
  handleActionRevokeClick = (resourceID, actions) => {
    if (actions.length === 0) {
      return;
    }

    this.revokeActionsRemaining = actions.length;
    actions.forEach(action => {
      ACLStore.revokeGroupActionToResource(
        this.props.itemID,
        action,
        resourceID
      );
    });
  };

  getACLs() {
    const Group = ACLGroupStore.getGroup(this.props.itemID);
    const allACLs = Group.getPermissions();

    if (allACLs == null) {
      return [];
    }

    const acls = [];

    if (allACLs && allACLs.length) {
      allACLs.forEach(acl => {
        const actions = [];
        acl.actions.forEach(action => {
          actions.push(action.name);
        });

        acls.push({
          rid: acl.rid,
          actions,
          removable: true
        });
      });
    }

    return acls;
  }
}
