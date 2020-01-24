import * as React from "react";
import { shallow, mount } from "enzyme";
import JestUtil from "#SRC/js/utils/JestUtil";

import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);

const GroupMemberTable = require("../GroupMemberTable").default;
const ACLGroupStore = require("../../stores/ACLGroupStore").default;
const ActionTypes = require("../../constants/ActionTypes");
const OrganizationReducer = require("../../../../Reducer");

PluginTestUtils.addReducer("organization", OrganizationReducer);

const groupDetailsFixture = require("../../../../../../tests/_fixtures/acl/group-with-details.json");

groupDetailsFixture.permissions = groupDetailsFixture.permissions.array;
groupDetailsFixture.users = groupDetailsFixture.users.array;

let thisGroupStoreGetGroup, thisInstance;

const WrappedComponent = JestUtil.withI18nProvider(GroupMemberTable);

describe("GroupMemberTable", () => {
  beforeEach(() => {
    thisGroupStoreGetGroup = ACLGroupStore.getGroupRaw;

    ACLGroupStore.getGroupRaw = groupID => {
      if (groupID === "unicode") {
        return groupDetailsFixture;
      }
    };

    thisInstance = mount(
      <WrappedComponent groupID="unicode" accountType="user" />
    );

    thisInstance
      .find("GroupMemberTable")
      .instance().handleOpenConfirm = jest.fn();
  });

  afterEach(() => {
    ACLGroupStore.removeAllListeners();
    ACLGroupStore.getGroupRaw = thisGroupStoreGetGroup;
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
      expect(
        thisInstance.find("GroupMemberTable").state("groupUpdateError")
      ).toEqual("foo bar");
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
      thisInstance
        .find("GroupMemberTable")
        .instance().onAclGroupStoreDeleteUserSuccess = jest.fn();

      ACLGroupStore.deleteUser("foo", "unicode");
      expect(
        thisInstance.find("GroupMemberTable").instance()
          .onAclGroupStoreDeleteUserSuccess.mock.calls.length
      ).toEqual(1);
    });
  });

  describe("#getConfirmModalContent", () => {
    beforeEach(() => {
      thisInstance.find("GroupMemberTable").setState({ userID: "bar" });
    });

    it("returns a message containing the group's name and user's name", () => {
      const modalContent = thisInstance
        .find("GroupMemberTable")
        .instance()
        .getConfirmModalContent({
          gid: "zed",
          description: "foo",
          users: [{ user: { uid: "bar", description: "qux" } }]
        });

      const component = shallow(modalContent);
      expect(component).toMatchSnapshot();
    });

    it("returns a message containing the error that was received", () => {
      thisInstance
        .find("GroupMemberTable")
        .setState({ groupUpdateError: "quux" });

      const modalContent = shallow(
        thisInstance
          .find("GroupMemberTable")
          .instance()
          .getConfirmModalContent({
            description: "foo",
            users: [{ user: { uid: "bar", description: "qux" } }]
          })
      );

      expect(
        modalContent
          .find("p")
          .at(0)
          .text()
      ).toEqual("quux");
    });
  });

  describe("#renderUserLabel", () => {
    it("returns the specified property from the object", () => {
      const label = thisInstance
        .find("GroupMemberTable")
        .instance()
        .renderUserLabel("foo", {
          uid: "baz",
          foo: "bar"
        });
      expect(label.props.to).toEqual("/organization/users/baz");
      expect(label.props.children).toEqual("bar");
    });
  });

  describe("#renderButton", () => {
    it("calls handleOpenConfirm with the proper arguments", () => {
      const buttonWrapper = shallow(
        thisInstance
          .find("GroupMemberTable")
          .instance()
          .renderButton("foo", { uid: "bar" })
      );

      buttonWrapper.find("button").simulate("click");

      expect(
        thisInstance.find("GroupMemberTable").instance().handleOpenConfirm.mock
          .calls[0][0]
      ).toEqual({
        uid: "bar"
      });
    });
  });
});
