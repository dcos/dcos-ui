import * as EventTypes from "../../constants/EventTypes";

import PluginSDK from "PluginSDK";

import { RequestUtil } from "mesosphere-shared-reactjs";

const SDK = PluginSDK.__getSDK("networking", { enabled: true });

require("../../../../SDK").setSDK(SDK);

const NetworkingNodeMembershipsStore = require("../NetworkingNodeMembershipsStore")
  .default;
import Config from "#SRC/js/config/Config";

import * as ActionTypes from "../../constants/ActionTypes";
import nodeMembershipsFixture from "../../../../../../tests/_fixtures/networking/networking-node-memberships.json";
const NetworkingReducer = require("../../../../Reducer");

PluginSDK.__addReducer("networking", NetworkingReducer);

let thisRequestFn, thisNodeMemberships, thisUseFixtures;

describe("NetworkingNodeMembershipsStore", () => {
  beforeEach(() => {
    thisRequestFn = RequestUtil.json;
    RequestUtil.json = handlers => {
      handlers.success(nodeMembershipsFixture);
    };
    thisNodeMemberships = {
      ...nodeMembershipsFixture
    };
  });

  afterEach(() => {
    RequestUtil.json = thisRequestFn;
  });

  it("returns all of the node memberships it was given", () => {
    thisUseFixtures = Config.useFixtures;
    Config.useFixtures = true;

    NetworkingNodeMembershipsStore.fetchNodeMemberships();
    const nodeMemberships = NetworkingNodeMembershipsStore.get(
      "nodeMemberships"
    );

    expect(nodeMemberships.length).toEqual(thisNodeMemberships.array.length);

    Config.useFixtures = thisUseFixtures;
  });

  describe("processNodeMemberships", () => {
    it("stores node memberships when event is dispatched", () => {
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_NODE_MEMBERSHIPS_SUCCESS,
        data: [{ foo: "bar", baz: "qux", quux: "grault" }]
      });

      const nodeMemberships = NetworkingNodeMembershipsStore.get(
        "nodeMemberships"
      );

      expect(nodeMemberships[0]).toEqual({
        foo: "bar",
        baz: "qux",
        quux: "grault"
      });
    });

    it("dispatches the correct event upon VIP request success", () => {
      const mockedFn = jest.fn();
      NetworkingNodeMembershipsStore.addChangeListener(
        EventTypes.NETWORKING_NODE_MEMBERSHIP_CHANGE,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_NODE_MEMBERSHIPS_SUCCESS,
        data: [{ foo: "bar", baz: "qux", quux: "grault" }]
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });
  });

  describe("processNodeMembershipsError", () => {
    it("dispatches the correct event upon VIP request error", () => {
      const mockedFn = jasmine.createSpy();
      NetworkingNodeMembershipsStore.addChangeListener(
        EventTypes.NETWORKING_NODE_MEMBERSHIP_REQUEST_ERROR,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_NODE_MEMBERSHIPS_ERROR,
        data: "foo"
      });

      expect(mockedFn.calls.count()).toEqual(1);
      expect(mockedFn.calls.mostRecent().args).toEqual(["foo"]);
    });
  });
});
