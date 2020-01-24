import * as EventTypes from "../../constants/EventTypes";

import PluginTestUtils from "PluginTestUtils";

import { RequestUtil } from "mesosphere-shared-reactjs";

const SDK = PluginTestUtils.getSDK("networking", { enabled: true });

require("../../../../SDK").setSDK(SDK);

import Config from "#SRC/js/config/Config";
const NetworkingBackendConnectionsStore = require("../NetworkingBackendConnectionsStore")
  .default;

import * as ActionTypes from "../../constants/ActionTypes";
import backendConnectionsFixture from "../../../../../../tests/_fixtures/networking/networking-backend-connections.json";
const NetworkingReducer = require("../../../../Reducer");

PluginTestUtils.addReducer("networking", NetworkingReducer);

let thisRequestFn, thisBackendConnections, thisUseFixtures;

describe("NetworkingBackendConnectionsStore", () => {
  beforeEach(() => {
    thisRequestFn = RequestUtil.json;
    RequestUtil.json = handlers => {
      handlers.success(backendConnectionsFixture);
    };
    thisBackendConnections = {
      ...backendConnectionsFixture
    };
  });

  afterEach(() => {
    RequestUtil.json = thisRequestFn;
  });

  it("returns the data it was given", () => {
    thisUseFixtures = Config.useFixtures;
    Config.useFixtures = true;

    NetworkingBackendConnectionsStore.startFetchBackendConnections(
      "foo",
      "bar",
      "baz"
    );
    const backendConnections = NetworkingBackendConnectionsStore.get(
      "backendConnections"
    );

    expect(backendConnections).toEqual({
      "foo:bar:baz": thisBackendConnections
    });

    Config.useFixtures = thisUseFixtures;
  });

  describe("processBackendConnections", () => {
    it("stores backend connection data in a hash with the VIP as the key", () => {
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_BACKEND_CONNECTIONS_SUCCESS,
        data: { qux: "quux" },
        vip: "foo:bar:baz"
      });

      const vipDetails = NetworkingBackendConnectionsStore.get(
        "backendConnections"
      );
      expect(vipDetails["foo:bar:baz"]).not.toBeNull();
    });

    it("stores backend connection data when event is dispatched", () => {
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_BACKEND_CONNECTIONS_SUCCESS,
        data: { qux: "quux", grault: "garply", waldo: "fred" },
        vip: "foo:bar:baz"
      });

      const vipDetails = NetworkingBackendConnectionsStore.get(
        "backendConnections"
      );
      expect(vipDetails["foo:bar:baz"]).toEqual({
        qux: "quux",
        grault: "garply",
        waldo: "fred"
      });
    });

    it("dispatches the correct event upon request success", () => {
      const mockedFn = jasmine.createSpy();
      NetworkingBackendConnectionsStore.addChangeListener(
        EventTypes.NETWORKING_BACKEND_CONNECTIONS_CHANGE,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_BACKEND_CONNECTIONS_SUCCESS,
        data: { qux: "quux", grault: "garply", waldo: "fred" },
        vip: "foo:bar:baz"
      });

      expect(mockedFn.calls.count()).toEqual(1);
      expect(mockedFn.calls.mostRecent().args).toEqual(["foo:bar:baz"]);
    });
  });

  describe("processBackendConnectionsError", () => {
    it("dispatches the correct event upon request error", () => {
      const mockedFn = jasmine.createSpy();
      NetworkingBackendConnectionsStore.addChangeListener(
        EventTypes.NETWORKING_BACKEND_CONNECTIONS_REQUEST_ERROR,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_BACKEND_CONNECTIONS_ERROR,
        data: "foo",
        vip: "foo:bar:baz"
      });

      expect(mockedFn.calls.count()).toEqual(1);
      expect(mockedFn.calls.mostRecent().args).toEqual(["foo", "foo:bar:baz"]);
    });
  });
});
