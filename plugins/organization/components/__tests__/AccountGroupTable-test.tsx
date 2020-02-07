import * as React from "react";
import { shallow } from "enzyme";

import User from "../../submodules/users/structs/User";

import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("organization", { enabled: true });
require("../../SDK").setSDK(SDK);

const ACLGroupStore = require("../../submodules/groups/stores/ACLGroupStore")
  .default;
const ACLUserStore = require("../../submodules/users/stores/ACLUserStore")
  .default;
const AccountGroupTable = require("../AccountGroupTable").default;
const ActionTypes = require("../../submodules/groups/constants/ActionTypes");

const userDetailsFixture = require("../../../../tests/_fixtures/acl/user-with-details.json");

userDetailsFixture.groups = userDetailsFixture.groups.array;

let thisUserStoreGetUser, thisInstance;

describe("AccountGroupTable", () => {
  beforeEach(() => {
    thisUserStoreGetUser = ACLUserStore.getUser;

    ACLUserStore.getUser = userID => {
      if (userID === "unicode") {
        return new User(userDetailsFixture);
      }
    };
    const getAccountDetails = () => ACLUserStore.getUser("unicode");

    thisInstance = shallow(
      <AccountGroupTable
        accountID={"unicode"}
        getAccountDetails={getAccountDetails}
      />
    );

    thisInstance.instance().handleOpenConfirm = jest.fn();
  });

  afterEach(() => {
    ACLUserStore.removeAllListeners();
    ACLGroupStore.removeAllListeners();
    ACLUserStore.getUser = thisUserStoreGetUser;
  });

  describe("#onAclGroupStoreDeleteUserError", () => {
    it("updates state when an error event is emitted", () => {
      ACLGroupStore.deleteUser = () => {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_REMOVE_USER_ERROR,
          data: "foo bar",
          groupID: "baz",
          userID: "unicode"
        });
      };

      ACLGroupStore.deleteUser("foo", "unicode");
      expect(thisInstance.state("userUpdateError")).toEqual("foo bar");
    });
  });

  describe("#onAclGroupStoreDeleteUserSuccess", () => {
    it("gets called when a success event is emitted", () => {
      ACLGroupStore.deleteUser = () => {
        SDK.dispatch({
          type: ActionTypes.REQUEST_ACL_GROUP_REMOVE_USER_SUCCESS,
          data: "foo bar",
          groupID: "baz",
          userID: "unicode"
        });
      };
      thisInstance.instance().onAclGroupStoreDeleteUserSuccess = jest.fn();

      ACLGroupStore.deleteUser("foo", "unicode");
      expect(
        thisInstance.instance().onAclGroupStoreDeleteUserSuccess.mock.calls
          .length
      ).toEqual(1);
    });
  });

  describe("#getConfirmModalContent", () => {
    beforeEach(() => {
      thisInstance.setState({ groupID: "bar" });
    });

    it("returns a message with the user's name and group name", () => {
      const modalContent = thisInstance.instance().getConfirmModalContent({
        uid: "zed",
        description: "foo",
        groups: [{ group: { gid: "bar", description: "qux" } }]
      });

      const component = shallow(modalContent);
      expect(component).toMatchSnapshot();
    });

    it("returns a message containing the error that was received", () => {
      thisInstance.setState({ userUpdateError: "quux" });
      const modalContent = thisInstance.instance().getConfirmModalContent({
        description: "foo",
        groups: [{ group: { gid: "bar", description: "qux" } }]
      });

      const component = shallow(modalContent);
      expect(
        component
          .find("p")
          .at(0)
          .text()
      ).toEqual("quux");
    });
  });

  describe("#renderGroupLabel", () => {
    it("returns the specified property from the object", () => {
      const label = thisInstance
        .instance()
        .renderGroupLabel("foo", { gid: 1, foo: "bar" });
      expect(label.props.to).toEqual("/organization/groups/1");
      expect(label.props.children).toEqual("bar");
    });
  });

  describe("#renderButton", () => {
    it("calls handleOpenConfirm with the proper arguments", () => {
      const buttonWrapper = shallow(
        thisInstance.instance().renderButton("foo", { gid: "bar" })
      );

      buttonWrapper.find("button").simulate("click");

      expect(
        thisInstance.instance().handleOpenConfirm.mock.calls[0][0]
      ).toEqual({
        gid: "bar"
      });
    });
  });
});
