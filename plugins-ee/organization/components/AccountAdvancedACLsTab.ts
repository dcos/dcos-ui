import PropTypes from "prop-types";

import StringUtil from "#SRC/js/utils/StringUtil";
import Util from "#SRC/js/utils/Util";

import ACLStore from "../submodules/acl/stores/ACLStore";
import AdvancedACLsTab from "./AdvancedACLsTab";

export default class AccountAdvancedACLsTab extends AdvancedACLsTab {
  static propTypes = {
    fetchPermissions: PropTypes.func.isRequired,
    getAccountDetails: PropTypes.func.isRequired,
    storeListenerName: PropTypes.string.isRequired
  };
  constructor(props) {
    super(...arguments);

    this.store_listeners[0].events.push(
      "createError",
      "userGrantSuccess",
      "userGrantError",
      "userRevokeSuccess",
      "userRevokeError"
    );
    // prettier-ignore
    this.store_listeners.push({name: props.storeListenerName, events: ["permissionsSuccess", "permissionsError"]});

    // When revoking an ACL to the resource,
    // we want both of these events to do the same thing.
    this.onAclStoreUserRevokeSuccess = this.onAclStoreRevokeResponse.bind(this);
    this.onAclStoreUserRevokeError = this.onAclStoreRevokeResponse.bind(this);

    const storeName = StringUtil.capitalize(props.storeListenerName);

    // When we receive the Principal's permissions then call child
    this[
      `on${storeName}StorePermissionsSuccess`
    ] = this.onAclStorePermissionsSuccess.bind(this);

    this[`on${storeName}StorePermissionsError`] = this.onPermissionsError.bind(
      this
    );

    // Debounce fetchPermissions as sometimes it may get called too frequently.
    // For example, when adding bulk permissions
    this.fetchPermissionsDebounced = Util.debounce(() => {
      this.props.fetchPermissions();
    }, 500);

    this.revokeActionsRemaining = 0;
  }

  UNSAFE_componentWillMount() {
    super.UNSAFE_componentWillMount();
    this.props.fetchPermissions();
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

  onAclStoreUserGrantSuccess({ resourceID, action }) {
    this.fetchPermissionsDebounced();
    // false, false - means there's no errors and it's not a dupe
    this.onAclStoreCreateResponse(false, false, resourceID, action);
  }

  onAclStoreUserGrantError(apiError, { resourceID, action }, xhr) {
    let isDupe = false;

    if (xhr.status === 409) {
      isDupe = true;
    }

    this.onAclStoreCreateResponse(apiError, isDupe, resourceID, action);
  }

  onAclStoreFetchResourceError(...args) {
    super.onAclStoreFetchResourceError(...args);
    this.props.fetchPermissions();
  }

  /**
   * This method will get called when we fetch the permissions of a user
   * and the request fails
   */
  onPermissionsError() {
    this.props.fetchPermissions();
    this.setState({
      itemPermissionsRequestErrors: this.state.itemPermissionsRequestErrors + 1
    });
  }

  handleFormSubmit = acls => {
    acls.forEach(({ actions, resource }) => {
      ACLStore.grantUserActionToResource(this.props.itemID, actions, resource);
    });
    this.setState({
      aclsToBeCreated: acls.length,
      aclsToBeCreatedDupes: [],
      aclsToBeCreatedErrors: [],
      aclsToBeCreatedSuccess: 0
    });
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
      ACLStore.revokeUserActionToResource(
        this.props.itemID,
        action,
        resourceID
      );
    });
  };

  getACLs() {
    const account = this.props.getAccountDetails();
    const allACLs = account.getPermissions();

    if (allACLs == null) {
      return [];
    }

    const acls = [];

    ["direct", "groups"].forEach(type => {
      if (allACLs[type]) {
        allACLs[type].forEach(acl => {
          const actions = [];
          acl.actions.forEach(action => {
            actions.push(action.name);
          });

          acls.push({
            ...acl,
            actions,
            removable: type === "direct"
          });
        });
      }
    });

    return acls;
  }
}
