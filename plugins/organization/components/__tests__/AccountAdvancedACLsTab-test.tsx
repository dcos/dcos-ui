import User from "../../submodules/users/structs/User";

import PluginSDK from "PluginSDK";

const React = require("react");

const ReactDOM = require("react-dom");

const SDK = PluginSDK.__getSDK("organization", { enabled: true });
require("../../SDK").setSDK(SDK);

const ACLUserActions = require("../../submodules/users/actions/ACLUsersActions")
  .default;
const ACLStore = require("../../submodules/acl/stores/ACLStore").default;
const ACLUserStore = require("../../submodules/users/stores/ACLUserStore")
  .default;
const AccountAdvancedACLsTab = require("../AccountAdvancedACLsTab").default;
const userDetailsFixture = require("../../../../tests/_fixtures/acl/user-with-details.json");

userDetailsFixture.groups = userDetailsFixture.groups.array;

let thisUserStoreGetUser, thisContainer, thisInstance;

describe("AccountAdvancedACLsTab", () => {
  beforeEach(() => {
    thisUserStoreGetUser = ACLUserStore.getUser;
    ACLUserStore.getUser = (userID) => {
      if (userID === "unicode") {
        return new User(userDetailsFixture);
      }
    };
    const fetchPermissions = () => {
      ACLUserActions.fetchUserPermissions("unicode");
    };
    const getAccount = () => ACLUserStore.getUser("unicode");

    thisContainer = document.createElement("div");
    thisInstance = ReactDOM.render(
      <AccountAdvancedACLsTab
        fetchPermissions={fetchPermissions}
        getAccountDetails={getAccount}
        itemID="unicode"
        storeListenerName="aclUser"
      />,
      thisContainer
    );
  });

  afterEach(() => {
    ACLUserStore.getUser = thisUserStoreGetUser;
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#getACLs", () => {
    it("returns empty array", () => {
      ACLUserStore.getUser = () => new User({});
      expect(thisInstance.getACLs()).toEqual([]);
    });

    it("returns acls correctly", () => {
      expect(thisInstance.getACLs()).toEqual([
        {
          rid: "dcos:adminrouter:service:marathon",
          actions: ["full"],
          removable: true,
          description: "Marathon",
          aclurl: "/acls/dcos:adminrouter:service:marathon",
        },
        {
          rid: "dcos:adminrouter:service:marathon",
          actions: ["full"],
          removable: false,
          description: "Marathon",
          aclurl: "/acls/dcos:adminrouter:service:marathon",
          membershipurl: "/groups/quis/users/quis",
          gid: "ölis",
        },
      ]);
    });
  });

  describe("#handleFormSubmit", () => {
    it("calls ACLStore#grantUserActionToResource", () => {
      spyOn(ACLStore, "grantUserActionToResource");

      thisInstance.handleFormSubmit([
        { actions: "foo", resource: "bar" },
        { actions: "baz", resource: "qux" },
      ]);

      expect(ACLStore.grantUserActionToResource.calls.count()).toEqual(2);
      expect(ACLStore.grantUserActionToResource.calls.allArgs()).toEqual([
        ["unicode", "foo", "bar"],
        ["unicode", "baz", "qux"],
      ]);
    });
  });
});
