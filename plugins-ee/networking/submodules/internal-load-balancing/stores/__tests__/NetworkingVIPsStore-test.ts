import * as EventTypes from "../../constants/EventTypes";

import PluginTestUtils from "PluginTestUtils";

import { RequestUtil } from "mesosphere-shared-reactjs";

const SDK = PluginTestUtils.getSDK("networking", { enabled: true });

require("../../../../SDK").setSDK(SDK);

const NetworkingVIPsStore = require("../NetworkingVIPsStore").default;
import Config from "#SRC/js/config/Config";

import * as ActionTypes from "../../constants/ActionTypes";
import vipsFixture from "../../../../../../tests/_fixtures/networking/networking-vips.json";
const NetworkingReducer = require("../../../../Reducer");

PluginTestUtils.addReducer("networking", NetworkingReducer);

let thisRequestFn, thisVipsFixture, thisUseFixtures;

describe("NetworkingVIPsStore", () => {
  beforeEach(() => {
    thisRequestFn = RequestUtil.json;
    RequestUtil.json = handlers => {
      handlers.success(vipsFixture);
    };
    thisVipsFixture = {
      ...vipsFixture
    };
  });

  afterEach(() => {
    RequestUtil.json = thisRequestFn;
  });

  it("returns all of the VIPs it was given", () => {
    thisUseFixtures = Config.useFixtures;
    Config.useFixtures = true;

    NetworkingVIPsStore.fetchVIPs();
    const vips = NetworkingVIPsStore.get("vips");

    expect(vips.length).toEqual(thisVipsFixture.array.length);

    Config.useFixtures = thisUseFixtures;
  });

  describe("processVIPs", () => {
    it("stores VIPs when event is dispatched", () => {
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_VIPS_SUCCESS,
        data: [{ ip: "foo", port: "bar", protocol: "baz" }]
      });

      const vips = NetworkingVIPsStore.get("vips");
      expect(vips[0].ip).toEqual("foo");
      expect(vips[0].port).toEqual("bar");
      expect(vips[0].protocol).toEqual("baz");
    });

    it("dispatches the correct event upon VIP request success", () => {
      const mockedFn = jest.fn();
      NetworkingVIPsStore.addChangeListener(
        EventTypes.NETWORKING_VIPS_CHANGE,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_VIPS_SUCCESS,
        data: [{ ip: "foo", port: "bar", protocol: "baz" }]
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });
  });

  describe("processVIPsError", () => {
    it("dispatches the correct event upon VIP request error", () => {
      const mockedFn = jasmine.createSpy();
      NetworkingVIPsStore.addChangeListener(
        EventTypes.NETWORKING_VIPS_REQUEST_ERROR,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_VIPS_ERROR,
        data: "foo"
      });

      expect(mockedFn.calls.count()).toEqual(1);
      expect(mockedFn.calls.mostRecent().args).toEqual(["foo"]);
    });
  });

  describe("processVIPDetail", () => {
    it("stores VIP detail in a hash with the VIP as the key", () => {
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_VIP_DETAIL_SUCCESS,
        data: { qux: "quux" },
        vip: "foo:bar:baz"
      });

      const vipDetails = NetworkingVIPsStore.get("vipDetail");
      expect(vipDetails["foo:bar:baz"]).not.toBeNull();
    });

    it("stores VIP detail when event is dispatched", () => {
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_VIP_DETAIL_SUCCESS,
        data: { qux: "quux", grault: "garply", waldo: "fred" },
        vip: "foo:bar:baz"
      });

      const vipDetails = NetworkingVIPsStore.get("vipDetail");
      expect(vipDetails["foo:bar:baz"]).toEqual({
        qux: "quux",
        grault: "garply",
        waldo: "fred"
      });
    });

    it("dispatches the correct event upon VIP detail request success", () => {
      const mockedFn = jasmine.createSpy();
      NetworkingVIPsStore.addChangeListener(
        EventTypes.NETWORKING_VIP_DETAIL_CHANGE,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_VIP_DETAIL_SUCCESS,
        data: { qux: "quux", grault: "garply", waldo: "fred" },
        vip: "foo:bar:baz"
      });

      expect(mockedFn.calls.count()).toEqual(1);
      expect(mockedFn.calls.mostRecent().args).toEqual(["foo:bar:baz"]);
    });
  });

  describe("processVIPDetailError", () => {
    it("dispatches the correct event upon VIP detail request error", () => {
      const mockedFn = jasmine.createSpy();
      NetworkingVIPsStore.addChangeListener(
        EventTypes.NETWORKING_VIP_DETAIL_REQUEST_ERROR,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_VIP_DETAIL_ERROR,
        data: "foo",
        vip: "foo:bar:baz"
      });

      expect(mockedFn.calls.count()).toEqual(1);
      expect(mockedFn.calls.mostRecent().args).toEqual(["foo:bar:baz", "foo"]);
    });
  });
});
