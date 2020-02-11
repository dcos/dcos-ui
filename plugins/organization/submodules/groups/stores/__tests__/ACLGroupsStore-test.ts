import GroupsList from "../../structs/GroupsList";
import * as EventTypes from "../../constants/EventTypes";

import PluginSDK from "PluginSDK";

import { RequestUtil } from "mesosphere-shared-reactjs";

const SDK = PluginSDK.__getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);

const ACLGroupsStore = require("../ACLGroupsStore").default;
import Config from "#SRC/js/config/Config";
import * as ActionTypes from "../../constants/ActionTypes";
const OrganizationReducer = require("../../../../Reducer");

PluginSDK.__addReducer("organization", OrganizationReducer);

const groupsFixture = require("../../../../../../tests/_fixtures/acl/groups-unicode.json");

let thisRequestFn, thisGroupsFixture;

describe("ACLGroupsStore", () => {
  beforeEach(() => {
    require("../../../../SDK").setSDK(SDK);

    thisRequestFn = RequestUtil.json;
    RequestUtil.json = handlers => {
      handlers.success(groupsFixture);
    };
    thisGroupsFixture = {
      ...groupsFixture
    };
  });

  afterEach(() => {
    RequestUtil.json = thisRequestFn;
  });

  it("returns an instance of GroupsList", () => {
    Config.useFixtures = true;
    ACLGroupsStore.fetchGroups();
    const groups = ACLGroupsStore.getGroups();
    expect(groups instanceof GroupsList).toBeTruthy();
  });

  it("returns all of the groups it was given", () => {
    Config.useFixtures = true;
    ACLGroupsStore.fetchGroups();
    const groups = ACLGroupsStore.getGroups().getItems();
    expect(groups.length).toEqual(thisGroupsFixture.array.length);
  });

  describe("dispatcher", () => {
    it("stores groups when event is dispatched", () => {
      SDK.dispatch({
        type: ActionTypes.REQUEST_ACL_GROUPS_SUCCESS,
        data: [{ gid: "foo", bar: "baz" }]
      });

      const groups = ACLGroupsStore.getGroups().getItems();
      expect(groups[0].gid).toEqual("foo");
      expect(groups[0].bar).toEqual("baz");
    });

    it("dispatches the correct event upon success", () => {
      const mockedFn = jest.fn();
      ACLGroupsStore.addChangeListener(EventTypes.ACL_GROUPS_CHANGE, mockedFn);
      SDK.dispatch({
        type: ActionTypes.REQUEST_ACL_GROUPS_SUCCESS,
        data: [{ gid: "foo", bar: "baz" }]
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });

    it("dispatches the correct event upon error", () => {
      const mockedFn = jasmine.createSpy("mockedFn");
      ACLGroupsStore.addChangeListener(
        EventTypes.ACL_GROUPS_REQUEST_ERROR,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_ACL_GROUPS_ERROR,
        data: "foo"
      });

      expect(mockedFn.calls.count()).toEqual(1);
      expect(mockedFn.calls.mostRecent().args).toEqual(["foo"]);
    });
  });
});
